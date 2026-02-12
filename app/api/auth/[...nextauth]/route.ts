import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Student from "@/models/Student";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                studentId: { label: "Student ID", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.studentId || !credentials?.password) {
                    throw new Error("Please enter Student ID and Password");
                }

                await dbConnect();

                const student = await Student.findOne({ idNo: credentials.studentId.toUpperCase() });
                if (!student) {
                    throw new Error("No student found with this ID");
                }

                // If password field exists, check hashed password
                if (student.password) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, student.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                } else if (student.displayPassword) {
                    // Fallback for legacy seeded students without hashed password (should be migrated)
                    if (credentials.password !== student.displayPassword) {
                        throw new Error("Invalid password");
                    }
                } else {
                    throw new Error("Account setup incomplete.");
                }

                return {
                    id: student._id.toString(),
                    name: student.name,
                    idNo: student.idNo,
                    level: "1", // Default level, ideally fetch from student record
                    role: "student"
                };
            },
        }),
    ],
    pages: {
        signIn: "/quiz/login",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.idNo = user.idNo;
                token.level = user.level;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.idNo = token.idNo;
                session.user.level = token.level;
                session.user.id = token.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
