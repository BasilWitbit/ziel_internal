import { supabase } from '@/lib/supabaseClient';
import type { ResponseData } from './mutations';
import axios from 'axios';
import { SUPABASE_API_KEY, SUPABASE_EDGE_BASE_URL } from '@/utils/constants';

// User type definition based on Supabase Users table
export type User = {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    role?: string;
    slug?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any; // For additional properties
};

export const getProjectById = async (
    projectId: string
): Promise<ResponseData<any | null>> => {
    try {
        // 1) Project
        const { data: project, error: projectErr } = await supabase
            .from("Project")
            .select("*")
            .eq("id", projectId)
            .single();

        if (projectErr || !project) {
            return {
                error: true,
                message: projectErr?.message ?? "Project not found.",
                data: null,
            };
        }

        // 2) Client (optional)
        let clientUser: any["clientUser"] = null;
        if (project.clientId) {
            const { data: client } = await supabase
                .from("Users")
                .select("id, firstName, lastName, email")
                .eq("id", project.clientId)
                .single();
            if (client) clientUser = client;
        }

        // 3) Team members via your junction table, embedded user
        const { data: memberRows, error: memberErr } = await supabase
            .from("TeamMember__User_Project")
            .select(
                `
        role,
        startTime,
        endTime,
        overlappingHoursRequired,
        requiresReporting,
        user:Users ( id, firstName, lastName, email )
      `
            )
            .eq("projectId", projectId);

        if (memberErr) {
            // Non-fatal: still return project without members
            console.warn("Team members fetch error:", memberErr.message);
        }

        const teamMembers = (memberRows ?? [])
            .map((row: any) => {
                const u = row.user;
                if (!u) return null;
                return {
                    id: u.id,
                    firstName: u.firstName ?? null,
                    lastName: u.lastName ?? null,
                    email: u.email,
                    role: row.role ?? null,
                    startTime: row.startTime ?? null,
                    endTime: row.endTime ?? null,
                    overlappingHoursRequired: row.overlappingHoursRequired ?? null,
                    requiresReporting: row.requiresReporting ?? null,
                };
            })
            .filter(Boolean);

        return {
            error: false,
            message: "Project fetched successfully",
            data: { ...project, clientUser, teamMembers },
        };
    } catch (err) {
        console.error("Error fetching project:", err);
        return {
            error: true,
            message:
                err instanceof Error ? err.message : "Failed to fetch the project.",
            data: null,
        };
    }
};

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

export const checkProjectNameExists = async (projectName: string): Promise<ResponseData<boolean>> => {
    try {
        const trimmedName = projectName.trim();
        if (!trimmedName) {
            return {
                error: false,
                message: 'Project name is empty',
                data: false
            };
        }

        const { data, error } = await supabase
            .from('Project')
            .select('id, name')
            .ilike('name', trimmedName);

        if (error) {
            throw new Error(error.message);
        }

        // Check for exact match (case-insensitive)
        const exactMatch = data?.some(project => 
            project.name.toLowerCase().trim() === trimmedName.toLowerCase()
        );

        return {
            error: false,
            message: exactMatch ? 'Project name already exists' : 'Project name is available',
            data: !!exactMatch
        };
    } catch (err) {
        console.error('Error checking project name:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while checking project name.'),
            data: false
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