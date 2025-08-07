import { Skeleton } from '@/components/ui/skeleton';
import UsersComponent from '@/components/use-case/UsersComponent';
import { getUsers, type User } from '@/services/queries';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';

const Users = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([])
    useEffect(() => {
        setLoading(true);
        getUsers().then(res => {
            if (res.error) {
                console.error('Error fetching users:', res.message);
                toast.error('Failed to fetch users: ' + res.message);
                return;
            }
            setUsers(res.data || []);
        }).catch(() => {
            toast.error('An unexpected error occurred while fetching users.');
        }).finally(() => setLoading(false));
    }, [])
    return (
        <>{loading ? <div className='flex flex-col gap-4'>
            <Skeleton className='h-[100px] w-full bg-gray-200'>&nbsp;</Skeleton>
            <Skeleton className='h-[20px] w-full bg-gray-200'>&nbsp;</Skeleton>
            <Skeleton className='h-[20px] w-full bg-gray-200'>&nbsp;</Skeleton>
        </div> : <UsersComponent users={users} />}</>
    )
}

export default Users;