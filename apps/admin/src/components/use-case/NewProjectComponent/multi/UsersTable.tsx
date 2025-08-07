import TableComponent from '@/components/common/TableComponent/TableComponent';
import type { TeamMember } from '@/pages/NewProject'
import { useUserStore } from '@/store/userStore';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import React, { type FC } from 'react'

export type RenderedUser = Omit<TeamMember, 'id'> & {
    name: string
}

type IProps = {
    teamMembers: TeamMember[];
}






const cols: ColumnDef<RenderedUser>[] = [
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
                <div className='flex justify-center items-center'>{requiresReporting ? <Check color='green' /> : <X color='red' />}</div>
            )
        }
    },
    {
        accessorKey: 'overlappingHoursRequired',
        header: 'Overlapping Hours',
    },
]


const UsersTable: FC<IProps> = ({
    teamMembers
}) => {
    const { users } = useUserStore();
    const dataRows: RenderedUser[] = teamMembers.map((eachMember) => {
        const foundUser = users.find(eachUser => eachUser.id === eachMember.id);
        return {
            name: foundUser?.name || '',
            role: eachMember?.role || '',
            startTime: eachMember?.startTime || '',
            endTime: eachMember?.endTime || '',
            overlappingHoursRequired: eachMember?.overlappingHoursRequired || 0,
            requiresReporting: eachMember?.requiresReporting || false,
        }
    })
    return (
        <TableComponent<RenderedUser> data={dataRows} columns={cols} />
    )
}

export default UsersTable