export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>&copy; {year} Resound</p>
        <p>
          Built by{' '}
          <a
            href="https://danielrobertson.dev"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            danielrobertson
          </a>
        </p>
      </div>
    </footer>
  )
}
