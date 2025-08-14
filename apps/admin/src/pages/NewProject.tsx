import { Skeleton } from '@/components/ui/skeleton';
import Page1 from '@/components/use-case/NewProjectComponent/multi/Page1';
import Page2 from '@/components/use-case/NewProjectComponent/multi/Page2';
import Page3 from '@/components/use-case/NewProjectComponent/multi/Page3';
import Page4 from '@/components/use-case/NewProjectComponent/multi/Page4';
import { getUsers } from '@/services/queries';
import { useUserStore } from '@/store/userStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export type TeamMember = {
    id: string,
    role: string,
    startTime: string,
    endTime: string,
    overlappingHoursRequired?: number,
    requiresReporting: boolean,

};

export type ProjectData = {
    projectName: string,
    projectDescription: string,
    clientUserId: string | null,
    users: TeamMember[],
}

const INITIAL_PROJECT_DATA = {
    projectName: '',
    projectDescription: '',
    clientUserId: null,
    users: []
}

export type ClientUser = {
    name: string,
    email: string,
    id: string | number
}

const NewProject = () => {
    const [stage, setStage] = useState(0);
    const [projectData, setProjectData] = useState<ProjectData>(INITIAL_PROJECT_DATA);
    const navigate = useNavigate();
    const { setUsers, setLoading, loading } = useUserStore();

    useEffect(() => {
        setLoading(true)
        getUsers().then(res => {
            if (res.error) {
                toast.error(res.message);
                return navigate('/projects')
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped = res.data?.map((u: any) => ({
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                id: `${u.id}`,
            }));
            setUsers(mapped ?? []);

        }).catch((err) => {
            toast.error(err.message);
            navigate('/projects')
        }).finally(() => {
            setLoading(false)
        })
    }, [])


    return (
        <>
            {loading ? <div className='w-full flex flex-col gap-3'>
                <Skeleton className='w-full h-[50px]' />
                <Skeleton className='w-full h-[50px]' />
                <Skeleton className='w-full h-[250px]' />
            </div> : <>
                {/* page 1 should control project name and description */}
                {stage === 0 ? <Page1
                    defaultValues={{
                        projectDescription: projectData.projectDescription,
                        projectName: projectData.projectName
                    }}
                    next={(data) => {
                        setProjectData(prevState => ({
                            ...prevState,
                            ...data
                        }))
                        setStage(prevState => prevState + 1)
                    }} back={() => {
                        navigate('/projects')
                    }} /> : null}
                {/* page 2 should select client (user), if cant find, should be able to add a new client */}
                {stage === 1 ? (
                    <Page2
                        next={(user) => {
                            setProjectData(prevState => ({
                                ...prevState,
                                clientUserId: `${user.id}`
                            }))
                            setStage(prevStage => prevStage + 1)
                        }}
                        defaultSelectedUserId={projectData.clientUserId ?? undefined}
                        back={() => setStage(0)}
                    />) : null}
                {/* page 3 should add users (project members and their roles) */}
                {stage === 2 ? (
                    <Page3
                        next={(usersList) => {
                            setProjectData(prevState => ({
                                ...prevState,
                                users: usersList
                            }))
                            setStage(prevStage => prevStage + 1)
                        }}
                        back={() => setStage(1)}
                        defaultSelectedUsers={projectData.users} />

                ) : null}
                {stage === 3 ? (
                    <Page4
                        projectData={projectData}
                        back={() => setStage(2)}
                        complete={() => {
                            toast.success('Project Added Successfully!')
                            navigate('/projects');
                        }}
                    />
                ) : null}
                {/* <NewProjectComponent next={(e) => console.log({ e })} /> */}
            </>}
        </>
    )
}

export default NewProject