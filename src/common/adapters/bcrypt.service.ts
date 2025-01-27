import bcrypt from "bcrypt";

export const bcryptService = {
    async generateHash(password: string) {
        try {
            const saltRounds = 10;
            return await bcrypt.hash(password, saltRounds);
        } catch (error: unknown) {
            throw new Error(`Error hashing password: ${error}`);
        }
    },

    async checkPassword(password: string, hash: string) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error: unknown) {
            throw new Error(`Error comparing passwords: ${error}`);
        }
    }
}