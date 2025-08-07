import NewUserComponent from '@/components/use-case/NewUserComponent'
import type { UserCategories } from '@/components/use-case/UsersComponent/UsersLayout';
import { useLocation } from 'react-router'

const NewUser = () => {
    // get type from URL params
    const location = useLocation()
    const admin = location;
    const defaultType = new URLSearchParams(admin.search).get('admin') === 'true' ? 'admins' : 'users' as UserCategories;

    return (
        <div><NewUserComponent defaultUserType={defaultType} /></div>
    )
}

export default NewUser