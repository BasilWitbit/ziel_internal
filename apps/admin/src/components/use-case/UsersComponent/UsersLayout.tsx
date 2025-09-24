import CardComponent from '@/components/common/CardComponent/CardComponent'
import LinkedButtonComponent from '@/components/common/LinkedButtonComponent.tsx'
import TableComponent from '@/components/common/TableComponent/TableComponent'
import type { User } from '@/api/types'
import type { ColumnDef } from '@tanstack/react-table'
import type { FC } from 'react'

const cols: ColumnDef<User>[] = [
    {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => (
            <div className="max-w-[200px] text-center mx-auto truncate">{getValue<string>()}</div>
        )

    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ cell }) => {
            const { firstName, lastName } = cell.row.original;
            return (
                <div className="max-w-[100px] text-center mx-auto truncate">{`${firstName} ${lastName ?? ''}`.trim()}</div>
            )
        }
    },
    {
        accessorKey: 'email',
        header: 'Email',
    }
]

export type UserCategories = 'users' | 'admins'

type IProps = {
    users: User[],
    createNewLabel?: string,
    type: UserCategories
}

const UsersLayout: FC<IProps> = ({ users, createNewLabel, type }) => {
    return (
        <div className='w-full'>
            <CardComponent className='flex flex-col gap-4'>
                {type === 'users' ? <LinkedButtonComponent className='self-start' variant={'outline'} to={`/users/new?admin=false`}>{createNewLabel || "Create new user"}</LinkedButtonComponent> : null}

                <TableComponent<User> data={users} columns={cols} />
            </CardComponent>
        </div>
    )
}

export default UsersLayout