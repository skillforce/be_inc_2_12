import { ObjectId } from "mongodb";

export const toObjectId = (id: string): ObjectId | null => {
    if (ObjectId.isValid(id) && id.length === 24) {
        return new ObjectId(id);
    }
    return null;
};