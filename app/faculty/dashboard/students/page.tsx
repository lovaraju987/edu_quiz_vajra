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
        if (newVisible.has(id)) newVisible.delete(id);
        else newVisible.add(id);
        setVisiblePasswords(newVisible);
    };

    useEffect(() => {
        const fetchProfileAndStudents = async () => {
            const session = localStorage.getItem("faculty_session");
            const faculty = session ? JSON.parse(session) : null;
            if (faculty) {
                try {
                    setIsAdmin(faculty.role === 'admin');
                    const pRes = await fetch(`/api/faculty/profile?facultyId=${faculty.id}`);
                    const pData = await pRes.json();
                    if (!pRes.ok || !pData.isProfileActive) {
                        setIsProfileActive(false);
                        setLoading(false);
                        return;
                    }
                    setPrefix(pData.uniqueId);
                    setSchoolName(pData.schoolName);
                    const sRes = await fetch(`/api/students?facultyId=${faculty.id}`);
                    const sData = await sRes.json();
                    if (Array.isArray(sData)) {
                        setStudents(sData);
                        const teachers = Array.from(new Set(sData.map((s: any) => s.facultyId?.name || "Admin").filter(Boolean))) as string[];
                        setUniqueTeachers(teachers);
                    }
                } catch (error) { console.error("Fetch error", error); }
            }
            setLoading(false);
        };
        fetchProfileAndStudents();
    }, []);

    const validateStudentForm = () => {
        if (!validateName(formData.name)) { toast.error("Full Name is required and must be at least 3 characters"); return false; }
        const age = parseInt(formData.age);
        if (isNaN(age) || age < 5 || age > 18) { toast.error("Invalid Age", { description: "Student age must be between 5 and 18 years." }); return false; }
        if (!formData.class) { toast.error("Please select a student class"); return false; }
        if (editingId && formData.password && formData.password.length < 6) { toast.error("New password must be at least 6 characters"); return false; }
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
                const res = await fetch('/api/students', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...formData }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents(students.map(s => s._id === editingId ? data.student : s));
                    setEditingId(null);
                    toast.success("Student updated successfully!");
                } else { toast.error(data.error || "Update failed"); return; }
            } else {
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, school: schoolName, facultyId: faculty?.id, prefix }),
                });
                const data = await res.json();
                if (res.ok) {
                    setStudents([data.student, ...students]);
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
                } else { toast.error(data.error || "Enrollment failed"); return; }
            }
            setFormData({ name: "", idNo: "", age: "", class: "", section: "", rollNo: "", password: "" });
        } catch (err) { toast.error("Something went wrong"); }
        finally { setIsSubmitting(false); }
    };

    const handleBulkSubmit = async () => {
        if (!bulkText.trim()) { toast.error("Please enter student data"); return; }
        setIsSubmitting(true);
        const session = localStorage.getItem("faculty_session");
        const faculty = session ? JSON.parse(session) : null;
        try {
            const rows = bulkText.trim().split('\n');
            const studentsToImport = rows.map(row => {
                const [name, className, section, rollNo, age] = row.split(',').map(s => s.trim());
                if (!name || !className) return null;
                return { name, class: className, section, rollNo, age };
            }).filter(Boolean);
            if (studentsToImport.length === 0) { toast.error("Invalid format. Please check your data."); setIsSubmitting(false); return; }
            const res = await fetch('/api/students/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: studentsToImport, school: schoolName, facultyId: faculty?.id, prefix })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`Successfully enrolled ${data.results.length} students!`);
                setBulkResults(data.results);
                setBulkText("");
                const sRes = await fetch(`/api/students?facultyId=${faculty.id}`);
                const sData = await sRes.json();
                if (Array.isArray(sData)) setStudents(sData);
            } else { toast.error(data.error || "Bulk import failed"); }
        } catch (err) { toast.error("Something went wrong with bulk import"); }
        finally { setIsSubmitting(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const data = await file.arrayBuffer();
            const workbook = read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonData.length < 2) { toast.error("Excel file is empty or missing data rows"); return; }
            const headerRow: any[] = jsonData[0] as any[];
            const lowerHeaders = headerRow.map(h => String(h).toLowerCase().trim());
            let nameIdx = lowerHeaders.findIndex(h => h.includes('name') && !h.includes('school'));
            let classIdx = lowerHeaders.findIndex(h => h.includes('class') || h.includes('grade'));
            let sectionIdx = lowerHeaders.findIndex(h => h.includes('section'));
            let rollIdx = lowerHeaders.findIndex(h => h.includes('roll'));
            const ageIdx = lowerHeaders.findIndex(h => h.includes('age'));
            if (nameIdx === -1 || classIdx === -1) {
                const firstRowData: any = jsonData[1];
                const col0IsNumber = !isNaN(parseInt(firstRowData[0]));
                const col1IsString = isNaN(parseInt(firstRowData[1]));
                if (col0IsNumber && col1IsString) { nameIdx = 1; rollIdx = 2; classIdx = 3; sectionIdx = 4; }
                else { nameIdx = 0; classIdx = 1; sectionIdx = 2; rollIdx = 3; }
            }
            const rows = jsonData.slice(1);
            const formattedText = rows.map((row: any) => {
                const name = row[nameIdx];
                const className = row[classIdx];
                const section = sectionIdx !== -1 ? row[sectionIdx] : '';
                const rollNo = rollIdx !== -1 ? row[rollIdx] : '';
                const age = ageIdx !== -1 ? row[ageIdx] : '';
                if (name && (className || rollNo)) return `${name}, ${className || ''}, ${section || ''}, ${rollNo}, ${age}`;
                return null;
            }).filter(Boolean).join('\n');
            setBulkText(formattedText);
            toast.success("Excel parsed! Review data below and click Import.");
        } catch (err) { toast.error("Failed to parse Excel file"); }
    };

    const handleEdit = (student: any) => {
        setEditingId(student._id);
        setFormData({ name: student.name, idNo: student.idNo, age: student.age || "", class: student.class, section: student.section || "", rollNo: student.rollNo || "", password: "" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        try {
            const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
            if (res.ok) { setStudents(students.filter(s => s._id !== id)); toast.success("Student deleted successfully"); }
            else { toast.error("Failed to delete"); }
        } catch (err) { toast.error("Error deleting student"); }
    };

    const handleExport = () => {
        if (students.length === 0) { toast.error("No students to export"); return; }
        const header = ["S.No", "Name", "ID", "Password", "Class", "Roll No", "Age", "School", "Enrolled By"];
        const rows = students.map((s, i) => [i + 1, s.name, s.idNo, s.displayPassword || "", s.class, s.rollNo || "", s.age || "", s.school, s.facultyId?.name || "Admin"]);
        const wb = utils.book_new();
        const ws = utils.aoa_to_sheet([header, ...rows]);
        ws['!cols'] = header.map(h => ({ wch: h.length + 5 }));
        utils.book_append_sheet(wb, ws, "Students");
        writeFile(wb, "Student_List.xlsx");
        toast.success("Student list exported!");
    };

    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading...</div>;

    if (!isProfileActive) {
        return (
            <div className="bg-white p-12 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">School Profile Not Activated</h2>
                <p className="text-slate-500 mb-8 font-medium">Please configure your School Name and Unique ID in the Profile section before you can enroll students.</p>
                <a href="/faculty/dashboard/profile" className="px-8 py-3 bg-blue-700 text-white font-black rounded-xl hover:bg-blue-800 transition-all">Go to Profile Setup</a>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Enrollment Card ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Navy Header */}
                <div className="bg-[#002e5d] px-8 py-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-white font-black text-lg tracking-tight truncate">
                            {editingId ? 'Edit Student Details' : 'Student Enrollment'}
                        </h2>
                        <p className="text-blue-200 text-xs mt-0.5 font-bold uppercase tracking-widest truncate">
                            {editingId ? 'Update the student information below' : `${schoolName} · Prefix: ${prefix}`}
                        </p>
                    </div>
                    {/* Pill Tabs */}
                    {!editingId && (
                        <div className="flex bg-white/10 p-1 rounded-xl gap-1 shrink-0">
                            <button
                                onClick={() => { setActiveTab('enroll'); setBulkResults([]); }}
                                className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'enroll' ? 'bg-white text-[#002e5d] shadow-sm' : 'text-white/70 hover:text-white'}`}
                            >Single</button>
                            <button
                                onClick={() => setActiveTab('bulk')}
                                className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'bulk' ? 'bg-white text-[#002e5d] shadow-sm' : 'text-white/70 hover:text-white'}`}
                            >Bulk Import</button>
                        </div>
                    )}
                </div>

                {/* Card Body */}
                <div className="p-8">
                    {activeTab === 'enroll' ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Info Banner */}
                            {!editingId && (
                                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                    <div className="w-8 h-8 bg-[#002e5d] rounded-lg flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[#002e5d] font-black text-sm">Automatic Credentials</p>
                                        <p className="text-blue-700 text-xs mt-0.5">Student credentials are <strong>auto-generated</strong>. Copy them after enrolling.</p>
                                    </div>
                                </div>
                            )}

                            {/* Name + ID Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name <span className="text-red-400">*</span></label>
                                    <input type="text" required value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#002e5d] outline-none font-bold text-sm text-slate-800 transition-all"
                                        placeholder="Full Name" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</label>
                                    {editingId ? (
                                        <input type="text" disabled value={formData.idNo}
                                            className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-100 rounded-xl font-mono text-slate-400 text-sm" />
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-mono italic">
                                            Auto-generated ({prefix}-24-XXX)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Age <span className="text-red-400">*</span></label>
                                    <input type="number" required min={5} max={18} value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#002e5d] outline-none font-bold text-sm text-slate-800 transition-all"
                                        placeholder="5–18" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Class <span className="text-red-400">*</span></label>
                                    <select required value={formData.class}
                                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#002e5d] outline-none font-bold text-sm text-slate-700 transition-all cursor-pointer">
                                        <option value="">Select</option>
                                        {["4th", "5th", "6th", "7th", "8th", "9th", "10th"].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</label>
                                    <input type="text" value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#002e5d] outline-none font-bold text-sm text-slate-800 transition-all uppercase"
                                        placeholder="e.g. A" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</label>
                                    <input type="text" value={formData.rollNo}
                                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#002e5d] outline-none font-bold text-sm text-slate-800 transition-all"
                                        placeholder="e.g. 101" />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                {editingId && (
                                    <button type="button"
                                        onClick={() => { setEditingId(null); setFormData({ name: "", idNo: "", age: "", class: "", section: "", rollNo: "", password: "" }); }}
                                        className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                                        Cancel
                                    </button>
                                )}
                                <button type="submit" disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-[#002e5d] text-white font-black rounded-xl hover:bg-[#003d7a] transition-all shadow-lg active:scale-95 disabled:opacity-60 text-sm">
                                    {isSubmitting ? 'Wait...' : (editingId ? 'Save Update' : 'Enroll Student')}
                                </button>
                            </div>
                        </form>
                    ) : (
                        /* ── Bulk Tab ── */
                        <div className="space-y-6">
                            {bulkResults.length > 0 ? (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                                    <h3 className="font-black text-emerald-800 text-base mb-1">Success!</h3>
                                    <p className="text-xs text-emerald-600 mb-4 font-bold uppercase tracking-widest">Credentials generated for {bulkResults.length} students</p>
                                    <div className="max-h-60 overflow-y-auto bg-white rounded-xl border border-emerald-100">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-emerald-100/50 text-emerald-900 font-black uppercase tracking-tighter sticky top-0">
                                                <tr><th className="p-3">Name</th><th className="p-3">ID</th><th className="p-3">Password</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-emerald-50">
                                                {bulkResults.map((res, i) => (
                                                    <tr key={i}>
                                                        <td className="p-3 font-bold text-slate-700">{res.name}</td>
                                                        <td className="p-3 font-mono font-black text-[#002e5d]">{res.idNo}</td>
                                                        <td className="p-3 font-mono font-bold text-emerald-600">{res.password}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <button onClick={() => {
                                            const text = bulkResults.map(r => `Name: ${r.name} | ID: ${r.idNo} | Pass: ${r.password}`).join('\n');
                                            navigator.clipboard.writeText(text);
                                            toast.success("Copied!");
                                        }}
                                            className="px-5 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition text-sm">Copy All</button>
                                        <button onClick={() => { setBulkResults([]); setBulkText(""); setActiveTab('enroll'); }}
                                            className="px-5 py-2.5 bg-white text-emerald-700 font-black rounded-xl border border-emerald-200 hover:bg-emerald-50 transition text-sm">Done</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Excel Upload</p>
                                            <label className="flex flex-col items-center justify-center gap-2 p-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 cursor-pointer transition-all group">
                                                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                                                <p className="font-black text-slate-600 text-sm group-hover:text-[#002e5d] transition-colors">Select Excel File</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">.xlsx / .xls only</p>
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Manual CSV Paste</p>
                                            <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                                                className="w-full h-32 p-4 bg-slate-50/50 border-2 border-slate-100 rounded-3xl focus:border-[#002e5d] outline-none font-mono text-xs text-slate-700 transition-all resize-none"
                                                placeholder={`Format: Name, Class, Section, Roll No, Age\nExample:\nRahul Sharma, 10, A, 101, 15`} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Instructions</p>
                                            <ul className="space-y-3">
                                                {["Name & Class are required", "IDs & Passwords auto-generated", "Excel detects columns automatically", "Roll# & Age are optional"].map((tip, i) => (
                                                    <li key={i} className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#002e5d]"></div>
                                                        <p className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{tip}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button onClick={handleBulkSubmit} disabled={isSubmitting}
                                            className="w-full py-4 bg-[#002e5d] text-white font-black rounded-2xl hover:bg-[#003d7a] transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 text-sm uppercase tracking-widest">
                                            {isSubmitting ? 'Processing...' : 'Start Import'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Students Table ── */}
            {(() => {
                const filteredStudents = students.filter(s => {
                    const search = searchTerm.toLowerCase();
                    const teacherName = s.facultyId?.name || "Admin";
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
                        <div className="p-8 border-b flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Enrolled Students</h2>
                                <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">
                                    {filteredStudents.length} Records Found
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input type="text" placeholder="Search students..." value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#002e5d] outline-none text-sm font-bold text-slate-700" />
                                </div>
                                {isAdmin && (
                                    <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}
                                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-black text-slate-700 cursor-pointer">
                                        <option value="All">All Teachers</option>
                                        {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                )}
                                <button onClick={handleExport}
                                    className="px-6 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
                                    Export
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sec</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll#</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        {isAdmin && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">By</th>}
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student, idx) => (
                                            <tr key={student._id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-8 py-4"><div className="font-black text-slate-800 text-sm tracking-tight">{student.name}</div></td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-black text-[10px]">{student.class}</span></td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">{student.section || '-'}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">{student.rollNo || '-'}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-700">{student.age || '-'}</td>
                                                <td className="px-6 py-4 font-mono text-xs text-blue-600 font-black">
                                                    {student.idNo.includes('-') ? student.idNo : `${prefix}-${student.idNo}`}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-bold text-slate-600 min-w-[70px]">
                                                            {visiblePasswords.has(student._id) ? (student.displayPassword || "••••••") : "••••••"}
                                                        </span>
                                                        <button onClick={() => togglePasswordVisibility(student._id)}
                                                            className="p-1 text-slate-400 hover:text-[#002e5d]">
                                                            {visiblePasswords.has(student._id) ? '👁️' : '🕶️'}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[80px] block">
                                                            {student.facultyId?.name?.split(' ')[0] || "Admin"}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-8 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => !student.hasAttempted && handleEdit(student)}
                                                            className={`text-blue-600 hover:scale-110 transition-transform ${student.hasAttempted ? 'opacity-20 cursor-not-allowed' : ''}`}>
                                                            ✏️
                                                        </button>
                                                        <button onClick={() => handleDelete(student._id)} className="text-red-500 hover:scale-110 transition-transform">
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="px-8 py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                                                No matching records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
