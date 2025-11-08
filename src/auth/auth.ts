
import NextAuth from "next-auth"
import { ZodError } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/src/schema/zod"
import bcryptjs from "bcryptjs"
import { getUserFromDb } from "@/src/utils/user"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {label: "Email", type: "email"},
                password: {label: "Password", type: "password"},
            },
            authorize: async (credentials) => {
                try {
                    if(!credentials?.email || !credentials?.password) {
                        throw new Error("Missing email and password")
                    }

                    const { email, password } = await signInSchema.parseAsync(credentials)

                    const user = await getUserFromDb(email)

                    if (!user || !user.password) {
                        console.error("Invalid credentials.")
                        return null;
                    }

                    const isPasswordValid = await bcryptjs.compare(
                        password,
                        user.password
                    )

                    if(!isPasswordValid) {
                        console.error("Invalid credentials.")
                        return null;
                    }

                    return { id: user.id.toString(), email: user.email };
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null;
                    }
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 3600
    },
    secret: process.env.JWT_SECRET,
    callbacks: {
        async jwt({ token, user } ) {
            if(user) {
                token.id = user.id;
            }
            return token;
        }
    }
})