import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabaseClient"
import TableComponent from '../components/common/TableComponent/TableComponent'

// Types
interface TeamMember {
    id: string
    name: string
    role: string
    email: string
}

interface Project {
    id: string
    projectName: string
    projectId: string
    clientName: string
    createdBy: string
    createdDate: string
    teamMembers: TeamMember[]
}

// Main Projects Component
const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from("Project")
                .select(`
                    id,
                    name,
                    description,
                    created_at,
                    clientId,
                    createdBy,
                    client:clientId (
                        firstName,
                        lastName
                    ),
                    creator:createdBy (
                        firstName,
                        lastName
                    ),
                    TeamMember__User_Project (
                        role,
                        userId,
                        user:userId (
                            firstName,
                            lastName,
                            email
                        )
                    )
                `)

            if (error) {
                console.error("Error fetching projects:", error)
                setLoading(false)
                return
            }

            const mappedProjects: Project[] = (data ?? []).map((item: any) => ({
                id: item.id,
                projectName: item.name,
                projectId: item.id,
                clientName: item.client
                    ? `${item.client.firstName} ${item.client.lastName}`
                    : '',
                createdBy: item.creator
                    ? `${item.creator.firstName} ${item.creator.lastName}`
                    : '',
                createdDate: item.created_at,
                teamMembers: (item.TeamMember__User_Project ?? []).map((tm: any) => ({
                    id: tm.userId,
                    name: tm.user
                        ? `${tm.user.firstName} ${tm.user.lastName}`
                        : '',
                    role: tm.role,
                    email: tm.user?.email || '',
                })),
            }))

            setProjects(mappedProjects)
            setLoading(false)
        }

        fetchProjects()
    }, [])

    // Handle logs button click
    const handleViewLogs = (member: TeamMember, project: Project) => {
        navigate('/user-logs', {
            state: {
                user: member,
                projectName: project.projectName,
                projectId: project.id
            }
        })
    }

    const columns: ColumnDef<Project>[] = [
        {
            accessorKey: 'projectName',
            header: 'Project Name',
            cell: ({ getValue }) => (
                <div className="font-medium text-left">
                    {getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: 'projectId',
            header: 'Project ID',
            cell: ({ getValue }) => (
                <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: 'clientName',
            header: 'Client Name',
            cell: ({ getValue }) => (
                <div className="text-blue-600 font-medium">
                    {getValue() as string}
                </div>
            ),
        },
        {
            accessorKey: 'createdBy',
            header: 'Created By',
        },
        {
            accessorKey: 'createdDate',
            header: 'Created Date',
            cell: ({ getValue }) => {
                const date = new Date(getValue() as string)
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            },
        },
    ]

    const renderTeamMembers = (project: Project) => (
        <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-border pb-2">
                Team Members ({project.teamMembers.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.teamMembers.map((member) => (
                    <div
                        key={member.id}
                        className="relative bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Logs button in top right */}
                        <Button
                            onClick={() => handleViewLogs(member, project)}
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                            title={`View logs for ${member.name}`}
                            variant="ghost"
                            size="icon"
                        >
                            <FileText className="w-4 h-4" />
                        </Button>

                        {/* Card content with padding to avoid overlap */}
                        <div className="pr-8 space-y-1">
                            <div className="font-semibold text-gray-900">{member.name}</div>
                            <div className="text-sm text-blue-600 font-medium">{member.role}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
                    <p className="text-gray-600">Manage and view all your projects</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-pulse text-gray-500">Loading projects...</div>
                        </div>
                    ) : (
                        <TableComponent
                            data={projects}
                            columns={columns}
                            searchKeys={['projectName', 'projectId', 'clientName', 'createdBy']}
                            expandable={true}
                            renderExpandedRow={renderTeamMembers}
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default Projects