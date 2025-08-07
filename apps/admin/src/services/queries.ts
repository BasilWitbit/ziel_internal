import { supabase } from '@/lib/supabaseClient';
import type { Database } from '../../types/supabase';
import type { ResponseData } from './mutations';
import axios from 'axios';
import { SUPABASE_API_KEY, SUPABASE_EDGE_BASE_URL } from '@/utils/constants';

export type User = Database['public']['Tables']['Users']['Row'];

export const getUsers = async (): Promise<ResponseData<User[] | null>> => {
    try {
        const { data } = await supabase.from('Users').select("*") as unknown as { data: User[] | null };
        return {
            error: false,
            message: 'Users fetched successfully',
            data
        };
    } catch (err) {
        console.error('Error fetching users:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while fetching users.'),
            data: null
        };
    }
};

export const buildUserSlug = async (name: string, dob: string): Promise<ResponseData<string | null>> => {
    try {
        const res = await axios.post(
            `${SUPABASE_EDGE_BASE_URL}generate-user-slug`,
            { name, dob },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${SUPABASE_API_KEY}`,
                },
            }
        );
        return {
            error: false,
            message: 'User slug built successfully',
            data: res.data.data.userSlug as string
        };
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            console.error('Axios error building slug:', err.response ?? err);
            return {
                error: true,
                message: err.response?.data?.message || err.message,
                data: null
            };
        } else if (err instanceof Error) {
            console.error('Error building slug:', err);
            return {
                error: true,
                message: err.message,
                data: null
            };
        } else {
            console.error('Unknown error building slug:', err);
            return {
                error: true,
                message: 'An unknown error occurred while building user slug.',
                data: null
            };
        }
    }

};