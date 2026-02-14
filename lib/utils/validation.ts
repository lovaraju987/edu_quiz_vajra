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
    // Supporting formats like JP-1001, VK-2026-001, etc.
    // Minimum 2 letters, followed by a hyphen, then alphanumeric/hyphen chars
    const re = /^[A-Z]{2,10}-[\w-]{3,15}$/;
    return re.test(id.toUpperCase());
};
