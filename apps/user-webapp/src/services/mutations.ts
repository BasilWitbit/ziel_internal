/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabaseClient";
import axios from "axios";
import { config } from "@/utils/config";
import type { GroupedPayload } from "@/components/use-case/DayEndLogsComponent/groupProjects";

export type ResponseData<T> = {
    error?: boolean;
    message?: string;
    data?: T;
}

type ChangesPayload = {
    name?: string;
    description?: string;
    clientUserId?: string;
}

export const updateProjectDetails = async (projectId: string,
    changes: ChangesPayload
): Promise<ResponseData<null>> => {
    try {
        const payload: ChangesPayload = {};
        if (changes.name) {
            payload.name = changes.name;
        }
        if (changes.description) {
            payload.description = changes.description;
        }
        if (changes.clientUserId) {
            payload.clientUserId = changes.clientUserId;
        }

        const { error } = await supabase
            .from('Project')
            .update(payload)
            .eq('id', projectId);

        if (error) {
            throw new Error(error.message || 'Failed to update project details');
        }

        return {
            error: false,
            message: 'Project Details updated successfully',
            data: null
        };

    } catch (err) {
        console.error('Error updating user status:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while updating user status.'),
            data: null
        };
    }
}

export const markUserAsNotNew = async (): Promise<ResponseData<null>> => {
    try {
        // 1. Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session?.user) {
            throw new Error(sessionError?.message || 'No active session found');
        }

        const authUserId = sessionData.session.user.id;

        // 2. Update Users table to set isNewUser = false
        const { error: updateError } = await supabase
            .from('Users')
            .update({ isNewUser: false })
            .eq('authId', authUserId);

        if (updateError) {
            throw new Error(updateError.message || 'Failed to update user status');
        }

        return {
            error: false,
            message: 'User status updated successfully',
            data: null
        };

    } catch (err) {
        console.error('Error updating user status:', err);
        return {
            error: true,
            message: (err instanceof Error ? err.message : 'An error occurred while updating user status.'),
            data: null
        };
    }
};
export const addDayEndLogsOfUser = async (logs: GroupedPayload[]): Promise<ResponseData<any>> => {
    try {
        const data = await supabase.auth.getSession()
        const accessToken = data.data.session?.access_token
        if (!accessToken) {
            throw new Error("Invalid Token")
        }
        const res = await axios.post(
            `${config.supabaseEdgeBaseUrl}add-day-end-logs`,
            logs,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (res.status !== 200) {
            throw new Error(res.data.message || 'Failed to add day end logs');
        }
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

