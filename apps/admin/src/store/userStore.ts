// src/stores/userStore.ts
import { create } from "zustand";

export type ClientUser = {
    name: string;
    email: string;
    id: string | number;
};

type UserState = {
    users: ClientUser[];
    loading: boolean;
    setUsers: (users: ClientUser[]) => void;
    addUser: (user: ClientUser) => void;
    setLoading: (loading: boolean) => void;
    resetUsers: () => void;
    findUserById: (userId: string) => ClientUser | null;
};

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    loading: false,
    findUserById: (userId: string) => {
        const users = get().users;
        const findUser = users.find(eachUser => eachUser.id === userId)
        return findUser || null;
    },
    setUsers: (users) => set({ users }),
    addUser: (user) =>
        set((state) => ({
            users: [...state.users, user],
        })),
    setLoading: (loading) => set({ loading }),
    resetUsers: () => set({ users: [] }),
}));
