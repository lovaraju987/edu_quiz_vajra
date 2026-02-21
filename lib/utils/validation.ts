export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) return { isValid: false, message: "Password must be at least 6 characters long" };
    // Add more strict rules if needed (uppercase, numbers, etc)
    return { isValid: true, message: "" };
};

export const validateName = (name: string): boolean => {
    return name.trim().length >= 3;
};

export const validatePhone = (phone: string): boolean => {
    const re = /^\d{10}$/; // Indian phone number standard for simplicity
    return re.test(phone);
};

export const validatePincode = (pincode: string): boolean => {
    const re = /^\d{6}$/;
    return re.test(pincode);
};

export const validateStudentId = (id: string): boolean => {
    // Supporting formats like JP-1001, VK-2026-001, T-1018-2026-033 etc.
    // Allow letters, numbers, and hyphens flexibly, as long as it starts with letters/numbers and is reasonably long
    const re = /^[A-Z0-9-]{5,25}$/;
    return re.test(id.toUpperCase());
};
