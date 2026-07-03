import { createAuthClient } from "better-auth/client";

// Same-origin: the client infers baseURL from the browser location, so no
// baseURL is needed. Import { signIn, signUp, signOut, useSession } from here.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
