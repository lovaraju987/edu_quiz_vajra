import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { students, school, facultyId, prefix } = await req.json();

        if (!Array.isArray(students) || students.length === 0) {
            return NextResponse.json({ error: 'No student data provided' }, { status: 400 });
        }

        const results = [];
        const errors = [];

        // Use current year for ID generation
        const year = new Date().getFullYear();
        const idPattern = new RegExp(`^${prefix}-${year}-\\d{3}$`);

        // Get last student sequence to start from
        const lastStudent = await Student.findOne({ idNo: idPattern })
            .sort({ createdAt: -1 })
            .collation({ locale: "en_US", numericOrdering: true });

        let nextSeq = 1;
        if (lastStudent) {
            const parts = lastStudent.idNo.split('-');
            const lastseq = parseInt(parts[parts.length - 1]);
            if (!isNaN(lastseq)) {
                nextSeq = lastseq + 1;
            }
        }

        for (const s of students) {
            try {
                // Generate unique ID
                const idNo = `${prefix}-${year}-${String(nextSeq).padStart(3, '0')}`;
                nextSeq++;

                // Generate random password
                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                let password = "";
                for (let i = 0; i < 6; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create student
                const newStudent = await Student.create({
                    name: s.name,
                    class: s.class,
                    section: s.section || '', // Include Section
                    rollNo: s.rollNo,
                    school,
                    facultyId,
                    idNo,
                    password: hashedPassword,
                    displayPassword: password,
                    isFirstLogin: true,
                    age: s.age || '' // Optional
                });

                // Update display password explicitly (fix for mongoose caching issues)
                await Student.collection.updateOne(
                    { _id: newStudent._id },
                    { $set: { displayPassword: password } }
                );

                results.push({
                    name: s.name,
                    idNo,
                    password,
                    rollNo: s.rollNo,
                    section: s.section || ''
                });

            } catch (err: any) {
                console.error("Bulk Import Error for row:", s, err);
                errors.push({ name: s.name, error: err.message });
            }
        }

        return NextResponse.json({
            message: `Successfully processed ${results.length} students.`,
            results,
            errors
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
