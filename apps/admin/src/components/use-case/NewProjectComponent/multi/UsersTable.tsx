/* eslint-disable @typescript-eslint/no-explicit-any */
import TableComponent from '@/components/common/TableComponent/TableComponent';
import type { TeamMember } from '@/pages/NewProject';
import { useUserStore } from '@/store/userStore';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type FC } from 'react';

export type RenderedUser = Omit<TeamMember, 'id'> & {
    name: string;
    id: string;
};

type IProps = {
    teamMembers: TeamMember[];
    onDelete?: (id: string) => void;
};

const UsersTable: FC<IProps> = ({ teamMembers, onDelete }) => {
    const { users } = useUserStore();

    const dataRows: RenderedUser[] = teamMembers.map((eachMember) => {
        const foundUser = users.find((eachUser) => eachUser.id === eachMember.id);
        return {
            id: eachMember.id,
            name: (eachMember as any).name || foundUser?.name || '',
            role: eachMember.role || '',
            startTime: eachMember.startTime || '',
            endTime: eachMember.endTime || '',
            //overlappingHoursRequired: eachMember.overlappingHoursRequired || 0,
            requiresReporting: eachMember.requiresReporting || false,
        };
    });

    const baseCols: ColumnDef<RenderedUser>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'role',
            header: 'Role',
        },
        {
            accessorKey: 'startTime',
            header: 'Start Time',
        },
        {
            accessorKey: 'endTime',
            header: 'End Time',
        },
        {
            accessorKey: 'requiresReporting',
            header: 'Reporting Required?',
            cell: ({ cell }) => {
                const { requiresReporting } = cell.row.original;
                return (
                    <div className='flex justify-center items-center'>
                        {requiresReporting ? <Check color='green' /> : <X color='red' />}
                    </div>
                );
            },
        },
    ];

    // Conditionally append delete column
    const columns: ColumnDef<RenderedUser>[] = onDelete
        ? [
            ...baseCols,
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => onDelete(row.original.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                ),
            },
        ]
        : baseCols;

    return <TableComponent<RenderedUser> data={dataRows} columns={columns} />;
};

export default UsersTable;