/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useNavigate, useParams } from "react-router";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl';
import { getProjectTeamMembers, type TeamMemberWithName, } from '@/services/queries';
import { toast } from 'sonner';
import AddTeamMemberModel from "@/components/use-case/NewProjectComponent/multi/AddTeamMemberModel";
import UsersTable from "@/components/use-case/NewProjectComponent/multi/UsersTable";
import { updateProjectTeamMembers } from "@/services/mutations";

const EditTeamMembers = () => {
    const navigate = useNavigate();
    const { id: projectId } = useParams<{ id: string }>();
    const [loading, setLoading] = React.useState(false);
    const [teamMembers, setTeamMembers] = React.useState<TeamMemberWithName[]>([]);
    const [openUserModel, setOpenUserModel] = React.useState(false);
    const [alreadyExistsError, setAlreadyExistsError] = React.useState(false);
    const [changed, setChanged] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (!projectId) return;
        setLoading(true);
        getProjectTeamMembers(projectId)
            .then((res) => {
                if (res.error || !res.data) {
                    toast.error(res.message || 'Failed to load team members');
                } else {
                    setTeamMembers([...res.data.map(eachMember => {
                        return {
                            id: eachMember.id,
                            name: eachMember.name,
                            role: eachMember.role,
                            startTime: eachMember.startTime,
                            endTime: eachMember.endTime,
                            overlappingHoursRequired: eachMember.overlappingHoursRequired,
                            requiresReporting: eachMember.requiresReporting,
                        }
                    })]);
                }
            })
            .finally(() => setLoading(false));
    }, [projectId]);

    const addTeamMember = (member: TeamMemberWithName) => {
        setChanged(true);
        const exists = teamMembers.find((tm) => tm.id === member.id);
        if (exists) return setAlreadyExistsError(true);
        setTeamMembers([...teamMembers, member]);
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
        const res = await updateProjectTeamMembers(projectId, teamMembers);
        if (res.error) toast.error(res.message);
        else {
            toast.success("Team members updated successfully");
            navigate(`/projects`);
        }
        setSaving(false);
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