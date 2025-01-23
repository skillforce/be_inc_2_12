import bcrypt from 'bcrypt';


export async function hashPasswordWithSalt(password: string): Promise<string> {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error:unknown) {
        throw new Error(`Error hashing password: ${error}`);
    }
}