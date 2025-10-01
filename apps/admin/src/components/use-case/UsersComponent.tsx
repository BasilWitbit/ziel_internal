import type { FC } from 'react'
import TabsComponent from './TabsComponent'
import UsersLayout from './UsersComponent/UsersLayout'
import type { User } from '@/api/types'

type IProps = {
    users: User[]
}

const UsersComponent: FC<IProps> = ({ users }) => {
    return (
        <div className='w-full'>
            <TabsComponent tabs={[
                { value: 'users', label: 'Users', content: <UsersLayout type="users" users={users.filter(eachUser => !eachUser.isAdmin)} /> },
                { value: 'admins', label: 'Admins', content: <UsersLayout type="admins" createNewLabel="Create new admin" users={users.filter(eachUser => eachUser.isAdmin)} /> }
            ]} />
        </div>
    )
}

export default UsersComponent