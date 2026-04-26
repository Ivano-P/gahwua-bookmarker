import { createAuthClient } from "better-auth/react"
import { usernameClient, adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [
        usernameClient(),
        adminClient(),
    ],
})

// Export des hooks pratiques pour l'UI
export const { signIn, signUp, useSession, signOut } = authClient;