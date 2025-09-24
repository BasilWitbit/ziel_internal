/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl';
// Supabase queries/mutations removed. Use localStorage fallback for loading/saving team members.

// Local minimal type for team members (avoid colliding with project-wide types)
type LocalTeamMember = {
    id: string;
    name: string;
    role: string;
    startTime: string;
    endTime: string;
    overlappingHoursRequired: number;
    requiresReporting: boolean;
}
import { toast } from 'sonner';
import { getProjectById, patchProjectTeamMembers } from '@/api/services';
import AddTeamMemberModel from "@/components/use-case/NewProjectComponent/multi/AddTeamMemberModel";
import UsersTable from "@/components/use-case/NewProjectComponent/multi/UsersTable";

const EditTeamMembers = () => {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();
    const [loading, setLoading] = React.useState(false);
    const [teamMembers, setTeamMembers] = React.useState<LocalTeamMember[]>([]);
    const [openUserModel, setOpenUserModel] = React.useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = React.useState(false);
    const [changed, setChanged] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!projectId) return;
        let mounted = true;
        setLoading(true);

        const load = async () => {
            try {
                // Try server first
                const resp = await getProjectById(projectId);
                if (!mounted) return;
                if (!resp.error && resp.data) {
                    const members = (resp.data as any).teamMembers || [];
                    const normalized = (members as any[]).map((m) => {
                        const user = m.user || {};
                        const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || '';
                        return {
                            id: m.userId ?? m.id ?? '',
                            name,
                            role: m.role ?? 'Member',
                            startTime: m.startTime ?? '',
                            endTime: m.endTime ?? '',
                            overlappingHoursRequired: m.overlappingHoursRequired ?? 0,
                            requiresReporting: m.requiresReporting ?? false,
                        } as LocalTeamMember;
                    });

                    setTeamMembers(normalized);
                    setLoading(false);
                    return;
                }

                // If server didn't return properly, fall back to localStorage
                const key = `project_team_${projectId}`;
                const stored = localStorage.getItem(key);
                if (stored) {
                    const parsed = JSON.parse(stored) as Partial<LocalTeamMember>[];
                    const normalized = parsed.map((p) => ({
                        id: p.id || '',
                        name: p.name || '',
                        role: p.role || 'Member',
                        startTime: p.startTime || '',
                        endTime: p.endTime || '',
                        overlappingHoursRequired: p.overlappingHoursRequired ?? 0,
                        requiresReporting: p.requiresReporting ?? false,
                    } as LocalTeamMember));
                    setTeamMembers(normalized);
                } else {
                    setTeamMembers([]);
                }
            } catch (err) {
                // on error fallback to localStorage
                const key = `project_team_${projectId}`;
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const parsed = JSON.parse(stored) as Partial<LocalTeamMember>[];
                        const normalized = parsed.map((p) => ({
                            id: p.id || '',
                            name: p.name || '',
                            role: p.role || 'Member',
                            startTime: p.startTime || '',
                            endTime: p.endTime || '',
                            overlappingHoursRequired: p.overlappingHoursRequired ?? 0,
                            requiresReporting: p.requiresReporting ?? false,
                        } as LocalTeamMember));
                        setTeamMembers(normalized);
                    } else {
                        setTeamMembers([]);
                    }
                } catch (e) {
                    toast.error('Failed to load team members');
                    setTeamMembers([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [projectId]);

    const addTeamMember = (member: Partial<LocalTeamMember>) => {
        setChanged(true);
        const id = member.id || Date.now().toString();
        const normalized: LocalTeamMember = {
            id,
            name: member.name || '',
            role: member.role || 'Member',
            startTime: member.startTime || '',
            endTime: member.endTime || '',
            overlappingHoursRequired: member.overlappingHoursRequired ?? 0,
            requiresReporting: member.requiresReporting ?? false,
        };
        const exists = teamMembers.find((tm) => tm.id === normalized.id);
        if (exists) return setAlreadyExistsError(true);
        setTeamMembers([...teamMembers, normalized]);
        setOpenUserModel(false);
        setAlreadyExistsError(false);
    };

    const removeTeamMember = (userId: string) => {
        setChanged(true);
        setTeamMembers((prev) => prev.filter((m) => m.id !== userId));
    };

    const handleSave = async () => {
        if (!projectId) return;
        setSaving(true);
        try {
            // Try to persist to server first
            const payload = teamMembers.map((m) => ({
                userId: m.id,
                role: m.role,
                startTime: m.startTime || '00:00:00',
                endTime: m.endTime || '00:00:00',
                overlappingHoursRequired: m.overlappingHoursRequired ?? 0,
                requiresReporting: m.requiresReporting ?? false,
            }));

            const resp = await patchProjectTeamMembers(projectId, payload as any);
            if (!resp.error) {
                // success - also persist locally as a copy
                const key = `project_team_${projectId}`;
                localStorage.setItem(key, JSON.stringify(teamMembers));
                toast.success(resp.message || 'Team members updated successfully');
                navigate(`/projects`);
                return;
            }

            // If server returned an error, fallback to localStorage
            const key = `project_team_${projectId}`;
            localStorage.setItem(key, JSON.stringify(teamMembers));
            toast.error(resp.message || 'Failed to update team members on server — saved locally');
            navigate(`/projects`);
        } catch (err) {
            // on exception, persist locally and notify
            const key = `project_team_${projectId}`;
            try { localStorage.setItem(key, JSON.stringify(teamMembers)); } catch (e) {}
            toast.error('Failed to update team members on server — saved locally');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Card><CardHeader><Skeleton className="h-7 w-64" /></CardHeader><CardContent className="space-y-6"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>;
    }
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Team Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between">
                        <h2 className="text-lg font-semibold">Team Members ({teamMembers.length})</h2>
                        <Button onClick={() => setOpenUserModel(true)} variant="default">Add Team Member</Button>
                    </div>
                    <Separator />
                    <UsersTable teamMembers={teamMembers} onDelete={removeTeamMember} />
                    <Button disabled={!changed} onClick={handleSave} loading={saving}>Save Changes</Button>
                </CardContent>
            </Card>

            <ModelComponentWithExternalControl
                title="Add Team Member"
                open={openUserModel}
                onOpenChange={setOpenUserModel}
            >
                <AddTeamMemberModel
                    alreadyExistsError={alreadyExistsError}
                    getUser={addTeamMember}
                />
            </ModelComponentWithExternalControl>
        </div>
    );
}

export default EditTeamMembers;