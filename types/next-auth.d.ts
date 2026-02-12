import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role?: string
            /** The user's level. */
            level?: string
            /** The user's student ID number. */
            idNo?: string
            /** The user's database ID. */
            id?: string
        } & DefaultSession["user"]
    }

    interface User {
        role?: string
        level?: string
        idNo?: string
        displayPassword?: string
        password?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        level?: string
        idNo?: string
        id?: string
    }
}
