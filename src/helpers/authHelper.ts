import bcrypt from 'bcrypt';


export async function hashPasswordWithSalt(password: string): Promise<string> {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error:unknown) {
        throw new Error(`Error hashing password: ${error}`);
    }
}


export async function comparePasswords(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error: unknown) {
        throw new Error(`Error comparing passwords: ${error}`);
    }
}