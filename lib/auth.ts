import jwt from 'jsonwebtoken';

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-123';

export function signToken(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}

export function getFacultyIdFromRequest(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token) as any;
    return decoded?.id || null;
}
