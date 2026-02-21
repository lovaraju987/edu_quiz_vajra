import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Student from '@/models/Student';
import QuizResult from '@/models/QuizResult';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const isDbConnected = await dbConnect();

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json([]); // Return empty list in mock mode for now
        }

        const { searchParams } = new URL(req.url);
        const facultyId = searchParams.get('facultyId');

        // Fetch faculty to get role and school name
        const Faculty = (await import('@/models/Faculty')).default;
        const faculty = await Faculty.findById(facultyId);

        let query = {};
        if (faculty) {
            if (faculty.role === 'admin') {
                // Admin: Show all students belonging to this school
                query = { school: faculty.schoolName };
            } else {
                // Teacher: Show only students they enrolled
                query = { facultyId: faculty._id };
            }
        } else if (facultyId) {
            // Fallback (shouldn't happen if ID is valid)
            query = { facultyId };
        }

        const students = await Student.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .populate('facultyId', 'name role');

        // Check if each student has attempted a quiz TODAY
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const studentsWithStatus = await Promise.all(students.map(async (student: any) => {
            const result = await QuizResult.findOne({
                idNo: student.idNo,
                attemptDate: { $gte: startOfToday }
            });
            return {
                ...student.toObject(),
                hasAttempted: !!result
            };
        }));

        return NextResponse.json(studentsWithStatus);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const isDbConnected = await dbConnect();
        const body = await req.json();
        let { name, idNo, class: studentClass, section, rollNo, school, facultyId, password, age, prefix } = body;

        // Auto-generation logic if idNo or password is missing
        if (!idNo || !password) {

            // Fetch Faculty to get the correct School Prefix
            const Faculty = (await import('@/models/Faculty')).default;
            const faculty = await Faculty.findById(facultyId);
            const Teacher = (await import('@/models/Teacher')).default;
            const teacher = await Teacher.findById(facultyId);

            // Determine Prefix: 
            // 1. If Admin, use their uniqueId directly.
            // 2. If Teacher, use their SCHOOL'S uniqueId derived from their record.
            if (faculty) {
                prefix = faculty.uniqueId; // e.g. EQ
            } else if (teacher) {
                // Teacher's uniqueId is typically {SchoolCode}-T{Num}
                // We want just the {SchoolCode} part. 
                // Or we can fetch the School Admin via teacher.schoolId
                if (teacher.schoolId) {
                    const schoolAdmin = await Faculty.findById(teacher.schoolId);
                    prefix = schoolAdmin?.uniqueId || "SCH";
                } else {
                    // Fallback: Try to extract from Teacher ID if format is EQ-T1001
                    prefix = teacher.uniqueId.split('-')[0] || "SCH";
                }
            }

            if (!prefix) prefix = "EQ"; // Final Fallback

            // Generate Password if missing
            if (!password) {
                const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                password = "";
                for (let i = 0; i < 6; i++) {
                    password += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            }

            // Generate ID if missing
            if (!idNo) {
                const year = new Date().getFullYear();
                // Pattern: {SchoolCode}-{Year}-{Seq} e.g. EQ-2026-001
                const idPatternRegex = new RegExp(`^${prefix}-${year}-\\d{3,}$`);

                // Find the latest student with this specific prefix pattern
                const lastStudent = await Student.findOne({ idNo: idPatternRegex })
                    .sort({ idNo: -1 }) // Sort by alphanumeric desc, effectively finding highest seq
                    .collation({ locale: "en_US", numericOrdering: true });

                let nextSeq = 1;
                if (lastStudent) {
                    const parts = lastStudent.idNo.split('-');
                    const lastseq = parseInt(parts[parts.length - 1]);
                    if (!isNaN(lastseq)) {
                        nextSeq = lastseq + 1;
                    }
                }
                idNo = `${prefix}-${year}-${String(nextSeq).padStart(3, '0')}`;
            }
        }

        // MOCK MODE FALLBACK
        if (isDbConnected === false) {
            return NextResponse.json({
                message: 'Student enrolled successfully (MOCK MODE)',
                student: {
                    ...body,
                    idNo: idNo.toUpperCase(),
                    displayPassword: password,
                    createdAt: new Date(),
                    isFirstLogin: true
                },
                credentials: { idNo, password }
            }, { status: 201 });
        }

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ idNo: idNo.toUpperCase() });
        if (existingStudent) {
            return NextResponse.json({ error: 'Student ID already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await Student.create({
            name,
            idNo: idNo.toUpperCase(),
            class: studentClass,
            section: section || '', // Save section
            rollNo,
            school,
            facultyId,
            password: hashedPassword,
            displayPassword: password,
            age,
            isFirstLogin: true
        });

        // Update using raw collection to bypass any Mongoose schema caching issues in development
        await Student.collection.updateOne(
            { _id: student._id },
            { $set: { displayPassword: password } }
        );

        // Fetch the fresh student record
        const savedStudent = await Student.findById(student._id).lean();

        return NextResponse.json({
            message: 'Student enrolled successfully',
            student: savedStudent,
            credentials: { idNo, password } // Return for frontend display
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { id, name, idNo, class: studentClass, section, rollNo, age, password } = body;

        if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        const updateData: any = { name, idNo, class: studentClass, section, rollNo, age };
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
            updateData.displayPassword = password; // Explicitly update plain text
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).lean();

        if (!updatedStudent) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

        // Force update displayPassword using raw collection to bypass any Mongoose cache issues
        if (password && password.trim() !== '') {
            await Student.collection.updateOne(
                { _id: updatedStudent._id },
                { $set: { displayPassword: password } }
            );
        }

        // Fetch fresh object for the frontend
        const freshStudent = await Student.findById(id).lean();

        return NextResponse.json({
            message: 'Student updated successfully',
            student: freshStudent
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Student ID required' }, { status: 400 });

        await Student.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Student deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
