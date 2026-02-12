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

                const student = await Student.findOne({ idNo: credentials.studentId.toUpperCase() }).lean();
                if (!student) {
                    throw new Error("No student found with this ID");
                }

                let isDefaultPassword = false;

                // Check hashed password
                if (student.password) {
                    const isPasswordValid = await bcrypt.compare(credentials.password, student.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                } else if (student.displayPassword) {
                    // Fallback for legacy seeded students without hashed password
                    if (credentials.password !== student.displayPassword) {
                        throw new Error("Invalid password");
                    }
                } else {
                    throw new Error("Account setup incomplete.");
                }

                // Force password update based on isFirstLogin OR displayPassword presence
                if (student.isFirstLogin || student.displayPassword) {
                    isDefaultPassword = true;
                }

                // Calculate Level based on Class
                let level = "1";
                if (student.class) {
                    const classNum = parseInt(student.class.toString().replace(/\D/g, ""));
                    if (classNum >= 4 && classNum <= 6) level = "1";
                    else if (classNum >= 7 && classNum <= 8) level = "2";
                    else if (classNum >= 9 && classNum <= 10) level = "3";
                }

                console.log("Authorize - Student:", student.idNo, "Class:", student.class, "Assigned Level:", level);

                return {
                    id: student._id.toString(),
                    name: student.name,
                    idNo: student.idNo,
                    level: level,
                    role: "student",
                    isDefaultPassword: isDefaultPassword
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
                console.log("JWT Callback - User:", user.idNo, "isDefaultPassword:", user.isDefaultPassword);
                token.idNo = user.idNo;
                token.level = user.level;
                token.id = user.id;
                token.role = user.role; // Add role to token
                token.isDefaultPassword = user.isDefaultPassword;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.idNo = token.idNo;
                session.user.level = token.level;
                session.user.id = token.id;
                session.user.role = token.role; // Add role to session
                session.user.isDefaultPassword = token.isDefaultPassword;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
