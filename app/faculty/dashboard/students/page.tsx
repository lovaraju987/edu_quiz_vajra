"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { validateName } from "@/lib/utils/validation";
import { read, utils, writeFile } from "xlsx";

export default function StudentsForm() {
    const [prefix, setPrefix] = useState("EQ");
    const [schoolName, setSchoolName] = useState("Vajra International");
    const [formData, setFormData] = useState({
        name: "",
        idNo: "",
        age: "",
        class: "",
        section: "",
        rollNo: "",
        password: "",
    });
    const [activeTab, setActiveTab] = useState<'enroll' | 'bulk'>('enroll');
    const [bulkText, setBulkText] = useState("");
    const [bulkResults, setBulkResults] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showFormPassword, setShowFormPassword] = useState(false);

    const [students, setStudents] = useState<any[]>([]);
    const [isProfileActive, setIsProfileActive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("All");
    const [uniqueTeachers, setUniqueTeachers] = useState<string[]>([]);

    const togglePasswordVisibility = (id: string) => {
        const newVisible = new Set(visiblePasswords);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisiblePasswords(newVisible);
    };

    useEffect(() => {
        const fetchProfileAndStudents = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                try {
                    // Check Role
                    setIsAdmin(faculty.role === 'admin');

                    // 1. Fetch real faculty profile status
                    const pRes = await fetch(`/api/faculty/profile?facultyId=${faculty.id}`);
                    const pData = await pRes.json();

                    if (!pRes.ok || !pData.isProfileActive) {
                        setIsProfileActive(false);
                        setLoading(false);
                        return;
                    }

                    setPrefix(pData.uniqueId);
                    setSchoolName(pData.schoolName);

                    // 2. Fetch students (now includes facultyId populated)
                    const sRes = await fetch(`/api/students?facultyId=${faculty.id}`);
                    const sData = await sRes.json();
                    if (Array.isArray(sData)) {
                        setStudents(sData);
                        // Extract unique teacher names for filter
                        const teachers = Array.from(new Set(sData.map((s: any) => s.facultyId?.name || "Admin").filter(Boolean))) as string[];
                        setUniqueTeachers(teachers);
                    }
                } catch (error) {
                    console.error("Fetch error", error);
                }
            }
            setLoading(false);
        };
        fetchProfileAndStudents();
    }, []);

    const validateStudentForm = () => {
        if (!validateName(formData.name)) {
            toast.error("Full Name is required and must be at least 3 characters");
            return false;
        }

        const age = parseInt(formData.age);
        if (isNaN(age) || age < 5 || age > 25) {
            toast.error("Invalid Age", {
                description: "Student age must be between 5 and 25 years."
            });
            return false;
        }

        if (!formData.class) {
            toast.error("Please select a student class");
            return false;
        }

        if (editingId && formData.password && formData.password.length < 6) {
            toast.error("New password must be at least 6 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validateStudentForm()) return;

        setIsSubmitting(true);

        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        try {
            if (editingId) {
                // UPDATE Mode
                // Ensure ID format is preserved or updated correctly
                let finalId = formData.idNo.toUpperCase();
                // If user edited ID (which they shoudn't really, but if they did), ensure prefix is handled?
                // Actually, let's assume for Edit mode we respect what's there.

                const res = await fetch('/api/students', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        ...formData,
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents(students.map(s => s._id === editingId ? data.student : s));
                    setEditingId(null);
                    toast.success("Student updated successfully!");
                } else {
                    toast.error(data.error || "Update failed");
                    return;
                }
            } else {
                // CREATE Mode
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        school: schoolName,
                        facultyId: faculty?.id,
                        prefix: prefix // Send prefix for auto-generation
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents([data.student, ...students]);

                    // Show credentials
                    toast.success(
                        <div className="space-y-2">
                            <p className="font-bold text-base">Student Enrolled!</p>
                            <div className="bg-slate-100 p-2 rounded text-slate-800 font-mono text-sm">
                                <div>ID: <span className="font-bold">{data.credentials.idNo}</span></div>
                                <div>Pass: <span className="font-bold">{data.credentials.password}</span></div>
                            </div>
                            <p className="text-xs">Credentials copied to clipboard</p>
                        </div>,
                        { duration: 10000 }
                    );
                    navigator.clipboard.writeText(`EduQuiz Login\nID: ${data.credentials.idNo}\nPassword: ${data.credentials.password}`);

                } else {
                    toast.error(data.error || "Enrollment failed");
                    return;
                }
            }

            // Reset Form
            setFormData({
                name: "",
                idNo: "",
                age: "",
                class: "",
                section: "",
                rollNo: "",
                password: "",
            });
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkSubmit = async () => {
        if (!bulkText.trim()) {
            toast.error("Please enter student data");
            return;
        }

        setIsSubmitting(true);
        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;

        try {
            // Parse CSV/Text
            const rows = bulkText.trim().split('\n');
            const studentsToImport = rows.map(row => {
                const [name, className, section, rollNo, age] = row.split(',').map(s => s.trim());
                if (!name || !className) return null;
                return { name, class: className, section, rollNo, age };
            }).filter(Boolean);

            if (studentsToImport.length === 0) {
                toast.error("Invalid format. Please check your data.");
                setIsSubmitting(false);
                return;
            }

            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    students: studentsToImport,
                    school: schoolName,
                    facultyId: faculty?.id,
                    prefix
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(`Successfully enrolled ${data.results.length} students!`);
                setBulkResults(data.results);
                setBulkText("");
                // Refresh list
                const sRes = await fetch(`/api/students?facultyId=${faculty.id}`);
                const sData = await sRes.json();
                if (Array.isArray(sData)) setStudents(sData);
            } else {
                toast.error(data.error || "Bulk import failed");
            }

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong with bulk import");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonData.length < 2) {
                toast.error("Excel file is empty or missing data rows");
                return;
            }

            // HEADER DETECTION LOGIC
            const headerRow: any[] = jsonData[0] as any[];
            const lowerHeaders = headerRow.map(h => String(h).toLowerCase().trim());

            let nameIdx = lowerHeaders.findIndex(h => h.includes('name') && !h.includes('school'));
            let classIdx = lowerHeaders.findIndex(h => h.includes('class') || h.includes('grade'));
            let sectionIdx = lowerHeaders.findIndex(h => h.includes('section'));
            let rollIdx = lowerHeaders.findIndex(h => h.includes('roll'));
            let ageIdx = lowerHeaders.findIndex(h => h.includes('age'));

            // Fallback Heuristics
            if (nameIdx === -1 || classIdx === -1) {
                const firstRowData: any = jsonData[1];
                const col0IsNumber = !isNaN(parseInt(firstRowData[0]));
                const col1IsString = isNaN(parseInt(firstRowData[1]));

                if (col0IsNumber && col1IsString) {
                    nameIdx = 1;
                    rollIdx = 2;
                    classIdx = 3;
                    sectionIdx = 4; // Default guess
                } else {
                    nameIdx = 0;
                    classIdx = 1;
                    sectionIdx = 2;
                    rollIdx = 3;
                }
            }

            const rows = jsonData.slice(1);

            const formattedText = rows.map((row: any) => {
                const name = row[nameIdx];
                const className = row[classIdx]; // Might need normalization if it is just a number
                const section = sectionIdx !== -1 ? row[sectionIdx] : '';

                const rollNo = rollIdx !== -1 ? row[rollIdx] : '';
                const age = ageIdx !== -1 ? row[ageIdx] : '';

                if (name && (className || rollNo)) { // Flexible check
                    return `${name}, ${className || ''}, ${section || ''}, ${rollNo}, ${age}`;
                }
                return null;
            }).filter(Boolean).join('\n');

            setBulkText(formattedText);
            toast.success("Excel parsed! Review data below and click Import.");
        } catch (err) {
            console.error(err);
            toast.error("Failed to parse Excel file");
        }
    };

    const handleEdit = (student: any) => {
        setEditingId(student._id);
        setFormData({
            name: student.name,
            idNo: student.idNo,
            age: student.age || "",
            class: student.class,
            section: student.section || "",
            rollNo: student.rollNo || "",
            password: "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStudents(students.filter(s => s._id !== id));
                toast.success("Student deleted successfully");
            } else {
                toast.error("Failed to delete");
            }
        } catch (err) {
            toast.error("Error deleting student");
        }
    };

    const handleExport = () => {
        if (students.length === 0) {
            toast.error("No students to export");
            return;
        }

        const header = ["S.No", "Name", "ID", "Password", "Class", "Roll No", "Age", "School", "Enrolled By"];
        const rows = students.map((s, i) => [
            i + 1,
            s.name,
            s.idNo,
            s.displayPassword || "",
            s.class,
            s.rollNo || "",
            s.age || "",
            s.school,
            s.facultyId?.name || "Admin"
        ]);

        const wb = utils.book_new();
        const ws = utils.aoa_to_sheet([header, ...rows]);

        // Auto-width for columns
        const wscols = header.map(h => ({ wch: h.length + 5 }));
        ws['!cols'] = wscols;

        utils.book_append_sheet(wb, ws, "Students");
        writeFile(wb, "Student_List.xlsx");
        toast.success("Student list exported!");
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading activation status...</div>;

    if (!isProfileActive) {
        return (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">School Profile Not Activated</h2>
                <p className="text-slate-500 mb-8 font-medium">Please configure your School Name and Unique ID in the Profile section before you can enroll students.</p>
                <a href="/faculty/dashboard/profile" className="px-8 py-3 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all">
                    Go to Profile Setup
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span>{editingId ? '✏️' : '📝'}</span> {editingId ? 'Edit Student Details' : 'Enroll New Student'}
                </h2>
                <div className="flex gap-4 mb-6 border-b border-slate-100 pb-1">
                    <button
                        onClick={() => { setActiveTab('enroll'); setEditingId(null); setBulkResults([]); }}
                        className={`text-lg font-bold px-4 py-2 border-b-2 transition-all ${activeTab === 'enroll' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        {editingId ? '✏️ Edit Student' : '📝 Single Enrollment'}
                    </button>
                    <button
                        onClick={() => { setActiveTab('bulk'); setEditingId(null); }}
                        className={`text-lg font-bold px-4 py-2 border-b-2 transition-all ${activeTab === 'bulk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        📂 Bulk Import
                    </button>
                </div>

                {activeTab === 'enroll' ? (
                    <form className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6" onSubmit={handleSubmit}>
                        <div className="col-span-1 md:col-span-4 lg:col-span-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <div className="text-2xl">ℹ️</div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Automatic Enrollment</h4>
                                <p className="text-blue-700 text-xs mt-1">
                                    Student ID and Password will be <strong>automatically generated</strong> upon enrollment.
                                    You will be able to copy the credentials immediately after registration.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Student Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>

                        {editingId ? (
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ID No.</label>
                                <input
                                    type="text"
                                    disabled
                                    value={formData.idNo}
                                    className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                                />
                            </div>
                        ) : (
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">ID No.</label>
                                <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 italic">
                                    Auto-generated ({prefix}-YYYY-XXX)
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Age</label>
                            <input
                                type="number"
                                required
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="15"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
                            <select
                                required
                                value={formData.class}
                                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                            >
                                <option value="">Select Class</option>
                                <option>4th</option>
                                <option>5th</option>
                                <option>6th</option>
                                <option>7th</option>
                                <option>8th</option>
                                <option>9th</option>
                                <option>10th</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Section</label>
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. A"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Roll Number</label>
                            <input
                                type="text"
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. 101"
                            />
                        </div>

                        {editingId && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Reset Password (Optional)
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showFormPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-12 transition-all font-mono"
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowFormPassword(!showFormPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all z-10"
                                        title={showFormPassword ? "Hide" : "Show"}
                                    >
                                        {showFormPassword ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="lg:col-span-3 flex justify-end gap-3">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ name: "", idNo: "", age: "", class: "", section: "", rollNo: "", password: "" });
                                    }}
                                    className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-800 hover:shadow-blue-200'}`}
                            >
                                {isSubmitting ? 'Processing...' : (editingId ? 'Update Student' : 'Generate & Register')}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        {bulkResults.length > 0 ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                <h3 className="font-bold text-green-800 text-lg mb-4">✅ Import Successful!</h3>
                                <p className="text-sm text-green-700 mb-4">You can copy these credentials and share them with your students.</p>

                                <div className="max-h-96 overflow-y-auto bg-white rounded-lg border border-green-100 shadow-inner">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-green-100 text-green-900 font-bold sticky top-0">
                                            <tr>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Roll No</th>
                                                <th className="p-3">Generated ID</th>
                                                <th className="p-3">Password</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-green-100">
                                            {bulkResults.map((res, i) => (
                                                <tr key={i}>
                                                    <td className="p-3 font-medium">{res.name}</td>
                                                    <td className="p-3">{res.rollNo || '-'}</td>
                                                    <td className="p-3 font-mono font-bold text-blue-600">{res.idNo}</td>
                                                    <td className="p-3 font-mono font-bold">{res.password}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={() => {
                                        const text = bulkResults.map(r => `Name: ${r.name} | ID: ${r.idNo} | Pass: ${r.password}`).join('\n');
                                        navigator.clipboard.writeText(text);
                                        toast.success("All credentials copied!");
                                    }}
                                    className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
                                >
                                    Copy All Credentials
                                </button>

                                <button
                                    onClick={() => { setBulkResults([]); setBulkText(""); setActiveTab('enroll'); }}
                                    className="mt-4 ml-0 sm:ml-4 px-6 py-2 text-green-700 hover:bg-green-100 font-bold rounded-lg transition w-full sm:w-auto"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-2">Option 1: Upload Excel</h3>
                                    <div className="mb-6 p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="text-4xl mb-2">📊</div>
                                        <p className="font-bold text-slate-700">Click to Upload Excel Sheet</p>
                                        <p className="text-xs text-slate-400 mt-1">.xlsx or .xls files only</p>
                                    </div>

                                    <h3 className="font-bold text-slate-800 mb-2">Option 2: Paste Data</h3>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Enter each student on a new line in this format:<br />
                                        <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">Name, Class, Section, Roll Number, Age</code>
                                    </p>
                                    <textarea
                                        value={bulkText}
                                        onChange={(e) => setBulkText(e.target.value)}
                                        className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                        placeholder={`Rahul Sharma, 10, A, 101, 15
Priya Singh, 10, B, 12, 15
Amit Kumar, 9, A, 102, 14`}
                                    ></textarea>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                        <h4 className="font-bold text-blue-900 text-sm mb-2">Instructions</h4>
                                        <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
                                            <li>Use a comma (,) to separate values.</li>
                                            <li><strong>Name</strong> and <strong>Class</strong> are required.</li>
                                            <li><strong>Roll Number</strong> and Age are optional.</li>
                                            <li>IDs and Passwords will be auto-generated.</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={handleBulkSubmit}
                                        disabled={isSubmitting}
                                        className={`w-full py-4 bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-800 hover:shadow-blue-200 active:scale-[0.98]'}`}
                                    >
                                        {isSubmitting ? 'Processing...' : '🚀 Import Students'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filtered Students Logic */}
            {(() => {
                const filteredStudents = students.filter(s => {
                    const search = searchTerm.toLowerCase();
                    const teacherName = s.facultyId?.name || "Admin"; // Fallback for old records or direct admin adds

                    const matchesTeacher = selectedTeacher === "All" || teacherName === selectedTeacher;

                    const matchesSearch = (
                        s.name.toLowerCase().includes(search) ||
                        s.idNo.toLowerCase().includes(search) ||
                        s.class.toLowerCase().includes(search) ||
                        (s.rollNo && s.rollNo.toString().toLowerCase().includes(search)) ||
                        (s.age && s.age.toString().toLowerCase().includes(search)) ||
                        (s.school && s.school.toLowerCase().includes(search)) ||
                        teacherName.toLowerCase().includes(search)
                    );

                    return matchesTeacher && matchesSearch;
                });

                return (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Enrolled Students</h2>
                                <p className="text-slate-500 text-sm mt-1">Manage and track your enrolled students for the current session.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {/* Teacher Filter Dropdown - ADMIN ONLY */}
                                {isAdmin && (
                                    <select
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 cursor-pointer"
                                    >
                                        <option value="All">All Teachers</option>
                                        {uniqueTeachers.map(teacher => (
                                            <option key={teacher} value={teacher}>{teacher}</option>
                                        ))}
                                    </select>
                                )}
                                <button
                                    onClick={handleExport}
                                    className="px-6 py-2 bg-green-50 text-green-700 font-bold rounded-xl border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all flex items-center gap-2 text-sm shadow-sm whitespace-nowrap"
                                >
                                    <span>📥</span> Export to Excel
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">School</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Class</th>
                                        {isAdmin && <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled By</th>}
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Section</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Roll No</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Password</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, idx) => (
                                            <tr key={student.idNo + idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="font-bold text-slate-800">{student.name}</div>
                                                </td>
                                                <td className="px-8 py-4 text-slate-600">{student.school}</td>
                                                <td className="px-8 py-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs">{student.class}</span>
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-8 py-4">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${student.facultyId?.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                            {student.facultyId?.name || "Admin"}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-8 py-4 font-bold text-slate-700">
                                                    {student.section || '-'}
                                                </td>
                                                <td className="px-8 py-4 font-mono text-sm text-slate-500">
                                                    {student.rollNo || '-'}
                                                </td>
                                                <td className="px-8 py-4 font-mono text-sm text-blue-600 font-bold">
                                                    {student.idNo.includes('-') ? student.idNo : `${prefix}-${student.idNo}`}
                                                </td>
                                                <td className="px-8 py-4 font-mono text-sm text-slate-600 font-bold">
                                                    <div className="flex items-center gap-3">
                                                        <span>
                                                            {visiblePasswords.has(student._id)
                                                                ? (student.displayPassword || "******** (Protected)")
                                                                : "••••••"}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(student._id)}
                                                            className={`p-1.5 rounded-lg transition-all border ${visiblePasswords.has(student._id)
                                                                ? "bg-blue-600 text-white border-blue-700"
                                                                : "bg-slate-50 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border-slate-200"
                                                                }`}
                                                            title={visiblePasswords.has(student._id) ? "Hide Password" : "Show Password"}
                                                        >
                                                            {visiblePasswords.has(student._id) ? (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => !student.hasAttempted && handleEdit(student)}
                                                        disabled={student.hasAttempted}
                                                        className={`p-2 rounded-lg transition-colors ${student.hasAttempted
                                                            ? "text-slate-300 cursor-not-allowed"
                                                            : "text-blue-600 hover:bg-blue-50"
                                                            }`}
                                                        title={student.hasAttempted ? "Cannot edit: Student has already started/finished the exam for today. This prevents results from being corrupted." : "Edit Details"}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button onClick={() => handleDelete(student._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="px-8 py-20 text-center text-slate-400 font-bold">
                                                <div className="text-4xl mb-2">🔍</div>
                                                No students found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()
            }
        </div>
    );
}
