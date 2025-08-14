import { Button } from '@/components/ui/button'
import type { TeamMember } from '@/pages/NewProject'
import { useEffect, useState, type FC } from 'react'
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl'
import AddTeamMemberModel from './AddTeamMemberModel'
import UsersTable from './UsersTable'


type IProps = {
    next: ((users: TeamMember[]) => void),
    back: () => void,
    defaultSelectedUsers: TeamMember[]
}


const Page3: FC<IProps> = ({ next, back, defaultSelectedUsers }) => {
    const [usersList, setUsersList] = useState<TeamMember[]>([])
    const [alreadyExistsError, setAlreadyExistsError] = useState(false);
    useEffect(() => {
        if (defaultSelectedUsers) {
            setUsersList(defaultSelectedUsers)
        }
    }, [])

    const [openUserModel, setOpenUserModel] = useState(false);

    return (
        <section className='flex flex-col gap-5'>
            <h1 className='font-bold text-xl'>Team Managed</h1>
            <div className=""><Button variant={'outline'} className='min-w-[100px]' onClick={back}>Back</Button></div>
            <div className="">
                <Button onClick={() => setOpenUserModel(true)}>Add Team Member</Button>
            </div>
            {usersList.length > 0 ? <>
                <h2 className='font-semibold text-lg'>Selected Team:</h2>
                <UsersTable teamMembers={usersList} />
                <div className="">
                    <Button className='w-[150px] bg-primary' onClick={() => {
                        next(usersList)
                    }}>Next</Button>
                </div>
            </> : null}
            <ModelComponentWithExternalControl title="Add Team Member to Project" open={openUserModel} onOpenChange={change => setOpenUserModel(change)}>
                <AddTeamMemberModel
                    alreadyExistsError={alreadyExistsError}
                    getUser={(selectedUser) => {
                        const temp = [...usersList];
                        const isFound = temp.find(eachUser => eachUser.id === selectedUser.id);
                        if (isFound) {
                            return setAlreadyExistsError(true);
                        }
                        temp.push(selectedUser);
                        setUsersList(temp);
                        setOpenUserModel(false);
                    }} />
            </ModelComponentWithExternalControl>
        </section >
    )
}

export default Page3