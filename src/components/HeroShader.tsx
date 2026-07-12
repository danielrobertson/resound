import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Slow domain-warped emerald glow behind the landing hero — a living version
 * of the static `.hero-wash` gradient, which stays mounted underneath as the
 * fallback (no WebGL2, reduced motion, or pre-hydration) and cross-fades out
 * once the shader is running.
 *
 * Rendering notes: single fullscreen triangle, 3 FBM evaluations per pixel at
 * half resolution; the loop pauses whenever the hero is off-screen or the tab
 * is hidden.
 */

const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`

const FRAG = `#version 300 es
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_tint_a;
uniform vec3 u_tint_b;
uniform float u_alpha;

out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.045;

  // Domain warp: one noise field displaces the sample point of the next,
  // which is what turns static clouds into slow liquid drift.
  vec2 q = vec2(
    fbm(p * 1.3 + vec2(0.0, t)),
    fbm(p * 1.3 + vec2(5.2, t * 0.7))
  );
  float f = fbm(p * 1.7 + 1.5 * q + vec2(t * 0.5, -t * 0.3));

  // Confine the glow to a soft dome descending from top center, matching the
  // footprint of the static .hero-wash gradient it replaces.
  float vertical = smoothstep(0.12, 0.95, uv.y);
  vec2 apex = vec2(0.5 * aspect, 1.1);
  float radial = 1.0 - smoothstep(0.1, 1.25, distance(p, apex));
  float glow = smoothstep(0.15, 1.0, f * 1.15) * vertical * radial;

  vec3 col = mix(u_tint_a, u_tint_b, clamp(f * f * 1.6, 0.0, 1.0));
  float a = glow * u_alpha;
  // Premultiplied alpha, matching the default WebGL canvas compositing mode.
  fragColor = vec4(col * a, a);
}`

// Emerald pair per theme (deep base → pale mint highlights), plus a master
// opacity — the single knob for how present the whole effect feels.
const THEMES = {
  light: { tintA: [0.16, 0.72, 0.52], tintB: [0.55, 0.93, 0.7], alpha: 0.16 },
  dark: { tintA: [0.01, 0.3, 0.22], tintB: [0.16, 0.6, 0.44], alpha: 0.3 },
} as const

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('HeroShader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('HeroShader link error:', gl.getProgramInfoLog(program))
      return
    }
    gl.useProgram(program)

    // Single triangle covering the viewport.
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'u_res')
    const uTime = gl.getUniformLocation(program, 'u_time')
    const uTintA = gl.getUniformLocation(program, 'u_tint_a')
    const uTintB = gl.getUniformLocation(program, 'u_tint_b')
    const uAlpha = gl.getUniformLocation(program, 'u_alpha')

    function applyTheme() {
      const theme = document.documentElement.classList.contains('dark')
        ? THEMES.dark
        : THEMES.light
      gl!.uniform3fv(uTintA, theme.tintA)
      gl!.uniform3fv(uTintB, theme.tintB)
      gl!.uniform1f(uAlpha, theme.alpha)
    }
    applyTheme()
    const themeObserver = new MutationObserver(applyTheme)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Soft gradients survive heavy downsampling — render at half resolution.
    const scale = Math.min(window.devicePixelRatio, 2) * 0.5
    function resize() {
      const w = Math.max(1, Math.round(canvas!.clientWidth * scale))
      const h = Math.max(1, Math.round(canvas!.clientHeight * scale))
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
        gl!.viewport(0, 0, w, h)
      }
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    // Only burn GPU while the hero is actually on screen in a visible tab.
    let raf = 0
    let inView = true
    const start = performance.now()

    function frame() {
      raf = 0
      if (!inView || document.hidden) return
      gl!.uniform1f(uTime, (performance.now() - start) / 1000)
      gl!.drawArrays(gl!.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(frame)
    }
    function play() {
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      play()
    })
    viewObserver.observe(canvas)
    const onVisibility = () => play()
    document.addEventListener('visibilitychange', onVisibility)

    play()
    setActive(true)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      viewObserver.disconnect()
      resizeObserver.disconnect()
      themeObserver.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] overflow-hidden"
    >
      <div
        className={cn(
          'hero-wash absolute inset-0 transition-opacity duration-1000',
          active && 'opacity-0',
        )}
      />
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 h-full w-full transition-opacity duration-1000',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
