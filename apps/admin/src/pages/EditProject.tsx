/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Pencil } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useParams } from "react-router";
import { getProjectById } from "@/services/queries";
import ModelComponentWithExternalControl from "@/components/common/ModelComponent/ModelComponentWithExternalControl";
import { capitalizeWords } from "@/utils/helpers";
import EditModelController from "@/components/use-case/EditProjectModels/EditModelController";
import { updateProjectDetails } from "@/services/mutations";
import { toast } from "sonner";

export type BasicUser = {
    id: string,
    firstName: string,
    lastName: string,
    email: string
}

type ProjectType = {
    name: string,
    description: string,
    clientUser: BasicUser,
}

// type TeamMember = {
//     id: string,
//     firstName: string,
//     lastName: string,
//     email: string,
//     role: string,
//     startTime: string,
//     endTime: string,
//     overlappingHoursRequired: number,
//     requiresReporting: boolean
// }

// const cols: ColumnDef<TeamMember>[] = [
//     {
//         id: "member",
//         header: () => <span className="block text-left w-full">Member</span>,
//         accessorFn: (m) => `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim(),
//         cell: ({ row }) => {
//             const m = row.original
//             const initials = `${(m.firstName?.[0] ?? "").toUpperCase()}${(m.lastName?.[0] ?? "").toUpperCase()}`
//             return (
//                 <div className="flex items-center gap-3 text-left">
//                     <div className="size-8 grid place-items-center rounded-full bg-muted text-xs font-medium">
//                         {initials}
//                     </div>
//                     <div className="text-sm">
//                         <div className="font-medium leading-none">
//                             {capitalizeWords(`${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()) || "—"}
//                         </div>
//                         <div className="text-xs text-muted-foreground">{m.email || "—"}</div>
//                     </div>
//                 </div>
//             )
//         },

//     },
//     {
//         accessorKey: 'startTime',
//         header: "Start Time"
//     },
//     {
//         accessorKey: 'endTime',
//         header: "End Time"
//     },
//     {
//         accessorKey: 'requiresReporting',
//         header: "Reporting Required?",
//         cell: ({ cell }) => {
//             const { requiresReporting } = cell.row.original;
//             return (
//                 <div className='flex justify-center items-center'>{requiresReporting ? <Check color='green' /> : <X color='red' />}</div>
//             )
//         }
//     },
//     {
//         accessorKey: 'overlappingHoursRequired',
//         header: "Overlapping Hours"
//     }
// ]


function fullName(u?: { firstName?: string | null; lastName?: string | null }) {
    if (!u) return "";
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
}

export type EditOptions = 'name' | 'desc' | 'client'

type EditModel = {
    key: null | EditOptions
}

type ChangesType = {
    name?: string | undefined,
    description?: string | undefined,
    clientUser?: BasicUser | undefined
}

export default function ProjectEditPage() {
    const navigate = useNavigate();
    const [saving, setSaving] = React.useState(false)
    const { id } = useParams<{ id: string }>();
    const [changes, setChanges] = React.useState<ChangesType>({
        name: undefined,
        description: undefined,
        clientUser: undefined,
    })
    const [loading, setLoading] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    const [project, setProject] = React.useState<ProjectType | null>(null);

    const [editModelState, setEditModelState] = React.useState<EditModel>({
        key: null
    })

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            if (!id) {
                setErrorMsg("Missing project id in the URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            const res = await getProjectById(id);
            if (!mounted) return;
            if (res.error || !res.data) {
                setErrorMsg(res.message || "Failed to fetch project.");
                setProject(null);
            } else {
                const projectToAdd: ProjectType = {
                    clientUser: {
                        id: res.data.clientUser.id ?? '',
                        email: res.data.clientUser.email ?? '',
                        firstName: capitalizeWords(res.data.clientUser.firstName) ?? '',
                        lastName: capitalizeWords(res.data.clientUser.lastName) ?? ''
                    },
                    description: res.data.description ?? '',
                    name: res.data.name ?? '',

                }
                setProject(projectToAdd);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FieldSkeleton />
                        <Separator />
                        <FieldSkeleton />
                        <Separator />
                        <FieldSkeleton />
                        <Separator />
                        <MembersSkeleton />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{errorMsg}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!project) return null;

    const handleSelectModelOption = (name: EditOptions) => {
        setEditModelState(prevState => ({
            ...prevState,
            key: name
        }))
    }

    const closeEditModelOption = () => {
        setEditModelState(prevState => ({
            ...prevState,
            key: null
        }))
    }

    return (
        <div className="">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FieldRow name="name" handleEdit={(option) => {
                        handleSelectModelOption(option)
                    }} label="Name" value={changes.name || project.name || "—"} />
                    <Separator />
                    <FieldRow
                        name="desc" handleEdit={(option) => {
                            handleSelectModelOption(option)
                        }}
                        label="Description"
                        value={changes.description || project.description?.trim() || "—"}
                        multiline
                    />
                    <Separator />
                    <FieldRow
                        name="client" handleEdit={(option) => {
                            handleSelectModelOption(option)
                        }}
                        label="Client"
                        value={changes.clientUser ? `${fullName(changes.clientUser)} (${changes.clientUser.email})` : project.clientUser
                            ? `${fullName(project.clientUser)} (${project.clientUser.email})`
                            : "—"
                        }
                    />

                    {/* <Separator />
                    <div className="flex flex-col items-start justify-between gap-4">
                        <div className="flex w-full justify-between items-center">
                            <div className="min-w-28 shrink-0 pt-[6px] text-sm font-medium">
                                Team Members
                            </div>
                            <IconButton onClick={() => {
                                setEditModelState(prevState => ({
                                    ...prevState,
                                    key: 'members'
                                }))
                            }} ariaLabel="Edit team members (disabled)" />
                        </div>
                        <div className="w-full">
                            <TableComponent<TeamMember> data={project.teamMembers} columns={cols} />
                        </div>

                    </div> */}
                    <Button loading={saving} onClick={() => {
                        setSaving(true);
                        updateProjectDetails(id as string, {
                            clientUserId: changes.clientUser?.id,
                            description: changes.description,
                            name: changes.name
                        }).then(res => {
                            if (res.error) {
                                // Handle error
                                console.error(res.message);
                                // Show error toast or notification
                                return toast.error(res.message);
                            }
                            toast.success('Project updated successfully');
                            navigate(`/projects`);
                        }).catch(err => {
                            if (err instanceof Error) {
                                // Handle error
                                console.error(err.message);
                                // Show error toast or notification
                                toast.error(err.message);
                            }
                        }).finally(() => {
                            setSaving(false);
                        });
                    }} disabled={Object.values(changes).filter(Boolean).length === 0}>Update Project</Button>
                </CardContent>

            </Card>
            <ModelComponentWithExternalControl open={!!editModelState.key}
                onOpenChange={(state) => {
                    if (!state) {
                        closeEditModelOption()
                    }
                }}
                title={`Edit ${capitalizeWords(editModelState.key || '')}`}
            >
                <EditModelController componentProps={{
                    name: {
                        defaultName: changes.name || project.name,
                        getValue: (name: string) => {
                            setChanges(prevState => ({
                                ...prevState,
                                name
                            }))
                            closeEditModelOption()
                        }
                    },
                    client: {
                        defaultClient: changes.clientUser || project.clientUser,
                        getValue: (clientUser) => {
                            setChanges(prevState => ({
                                ...prevState,
                                clientUser
                            }))
                            closeEditModelOption()
                        }
                    },
                    desc: {
                        defaultDesc: changes.description || project.description,
                        getValue: (description: string) => {
                            setChanges(prevState => ({
                                ...prevState,
                                description
                            }))
                            closeEditModelOption()
                        }
                    },
                }} name={editModelState.key as EditOptions} />
            </ModelComponentWithExternalControl>
        </div>
    );
}

/** ---------- UI bits ---------- */

function FieldRow({
    label,
    value,
    multiline,
    name,
    handleEdit
}: {
    label: string;
    value: string;
    multiline?: boolean;
    name: EditOptions;
    handleEdit: (name: EditOptions) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-28 shrink-0 pt-[6px] text-sm font-medium">
                {label}
            </div>
            <div className="flex-1">
                {multiline ? (
                    <p className="whitespace-pre-wrap text-sm text-foreground">{value}</p>
                ) : (
                    <div className="text-sm text-foreground">{value}</div>
                )}
            </div>
            <IconButton
                onClick={() => {
                    handleEdit(name)
                }}

                ariaLabel={`Edit ${label.toLowerCase()} (disabled)`} />
        </div>
    );
}

function IconButton({ ariaLabel, onClick }: { ariaLabel: string, onClick?: () => void }) {
    return (
        <Button
            variant="secondary"
            size="icon"
            className="hover:bg-muted"
            onClick={() => {
                if (onClick) {
                    onClick()
                }
            }}
            aria-label={ariaLabel}
        >
            <Pencil className="size-4" />
        </Button>
    );
}

function FieldSkeleton() {
    return (
        <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
        </div>
    );
}

function MembersSkeleton() {
    return (
        <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-4 w-28" />
            <div className="flex-1 flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
        </div>
    );
}
