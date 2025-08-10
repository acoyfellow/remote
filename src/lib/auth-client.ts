import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // Let Better Auth automatically determine the base URL
}); 

export const { signIn, signOut, signUp, useSession } = authClient;
