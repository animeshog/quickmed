import jwt from 'jsonwebtoken';

async function generateToken(userId: string) {
    return jwt.sign(userId, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });
}
export generateToken;