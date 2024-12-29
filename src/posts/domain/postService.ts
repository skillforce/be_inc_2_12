import { db, setDB } from "../../db/db";
import { AddUpdatePostRequestRequiredData, PostDBType } from "../types/types";


export const postService = {
    getAllPosts: async (): Promise<PostDBType[]> => {
        return db.posts;
    },

    getPostById: async (id: string): Promise<PostDBType | null> => {
        const postById = db.posts.find(post => post.id === id);
        return postById || null;
    },

    addPost: async (newPostData: PostDBType): Promise<PostDBType> => {
        setDB({ posts: [...db.posts, newPostData] });
        return newPostData;
    },

    updatePost: async (id:string, postDataForUpdates: AddUpdatePostRequestRequiredData): Promise<boolean> => {
        const newPostCollection = db.posts.map(post =>
            post.id === id ? { ...post, ...postDataForUpdates } : post
        );
        setDB({ posts: newPostCollection });
        return true;
    },

    deletePost: async (id: string): Promise<boolean> => {
        const newArr = db.posts.filter(post => post.id !== id);
        setDB({ posts: newArr });
        return true;
    },
};