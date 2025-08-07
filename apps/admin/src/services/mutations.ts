/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import { buildUserSlug, type User } from "./queries";
import { NEW_USER_PASS, SUPABASE_EDGE_BASE_URL } from "@/utils/constants";
import axios from "axios";
import type { ProjectData } from "@/pages/NewProject";

export type ResponseData<T> = {
    error?: boolean;
    message?: string;
    data?: T;
}

export const createUser = async (userData: {
    firstName: string,
    lastName?: string,
    email: string,
    isAdmin: boolean,
    isClient?: boolean
}): Promise<ResponseData<User | null>> => {
    try {
        const fullName = `${userData.firstName} ${userData.lastName ?? ''}`.trim();

        // 1. Generate slug
        const { data: slugData, error: slugError, message: slugMessage } = await buildUserSlug(fullName, new Date().toISOString());
        if (slugError) {
            console.error(slugError);
            return {
                error: true,
                message: slugMessage || 'Failed to build user slug',
                data: null
            };
        }

        // 2. Create Supabase Auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email,
            password: NEW_USER_PASS,
            email_confirm: true
        });

        if (authError || !authUser?.user) throw new Error(authError?.message || 'Auth user creation failed');

        const authUserId = authUser.user.id;

        // 3. Check if user already exists
        const { data: existingAppUser, error: existingUserError } = await supabase
            .from('Users')
            .select('*')
            .eq('id', authUserId)
            .single();

        if (existingAppUser) {
            console.error(existingUserError);
            throw new Error('User already exists in Users table');
        }

        // 4. Insert into custom Users table
        const { data: insertedUser, error: insertError } = await supabaseAdmin
            .from('Users')
            .insert([{
                authId: authUserId,
                firstName: userData.firstName,
                lastName: userData.lastName ?? '',
                email: userData.email,
                isAdmin: userData.isAdmin,
                isNewUser: true,
                slug: slugData,
            }])
            .select("*")
            .single();

        if (insertError || !insertedUser) {
            throw new Error(insertError?.message || 'Failed to insert user into Users table');
        }

        return {
            error: false,
            message: 'User created successfully and invitation sent',
            data: insertedUser
        };

    } catch (err) {
        console.error('Error creating user:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while creating the user.'),
            data: null
        };
    }
};


export const createProject = async (projectData: ProjectData): Promise<ResponseData<any>> => {
    try {
        const data = await supabase.auth.getSession()
        const accessToken = data.data.session?.access_token
        if (!accessToken) {
            throw new Error("Invalid Token")
        }
        const res = await axios.post(
            `${SUPABASE_EDGE_BASE_URL}create-project`,
            projectData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log({ res })
        return {
            error: false,
            message: '',
            data: res.data
        };

    } catch (err) {
        console.error('Error creating user:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while creating the user.'),
            data: null
        };
    }
};

