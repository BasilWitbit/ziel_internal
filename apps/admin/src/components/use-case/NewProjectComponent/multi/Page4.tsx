import { Button } from '@/components/ui/button'
import type { ProjectData, TeamMember } from '@/pages/NewProject'
import { type FC } from 'react'
import UsersTable from './UsersTable'
import { capitalizeWords } from '@/utils/helpers'
import { useUserStore } from '@/store/userStore'
import CardComponent from '@/components/common/CardComponent/CardComponent'
import { createProject } from '@/services/mutations'
import { toast } from 'sonner'


type IProps = {
    back: () => void,
    projectData: ProjectData,
    complete: () => void,
}

type UserToShow = TeamMember & {
    name: string
}

const Page4: FC<IProps> = ({ projectData, back, complete }) => {
    const { findUserById } = useUserStore();
    const client = findUserById(projectData.clientUserId ?? '');
    const teamMembers: UserToShow[] = projectData.users.map((eachUser) => {
        const userFound = findUserById(eachUser.id);
        if (userFound) {
            return {
                ...eachUser,
                name: userFound.name
            }
        }
    }).filter((eachUser) => !!eachUser);

    return (
        <section className='flex flex-col gap-5'>
            <h1 className='font-bold text-xl'>Project Details</h1>
            <div className="flex gap-2">
                <Button variant={'outline'} className='min-w-[100px]' onClick={back}>Back</Button>
                <Button className='min-w-[100px] bg-primary' onClick={() => {
                    createProject(projectData).then(res => {
                        if (res.error) {
                            return toast.error(res.message)
                        }
                        complete();
                    })
                }}>Create Project</Button>
            </div>
            <div className="flex flex-col gap-3">
                <h2 className='text-lg font-semibold'>
                    {capitalizeWords(projectData.projectName)}
                </h2>
                <p className='text-gray-500 font-normal'>
                    {projectData.projectDescription}
                </p>
                <>
                    <p className='font-semibold text-lg'>
                        Selected Client:
                    </p>
                    <div className="flex flex-col gap-3">
                        {client ? <CardComponent className="flex gap-4 items-center">
                            <div className="flex flex-col gap-1">
                                <p>{client.name}</p>
                                <p>{client.email}</p>
                            </div>
                        </CardComponent> : null}
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className='text-lg font-semibold'>Team Members</h2>
                        <UsersTable teamMembers={teamMembers} />
                    </div>
                </>
            </div>
        </section >
    )
}

export default Page4