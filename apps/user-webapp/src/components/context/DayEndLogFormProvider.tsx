/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type FC, type ReactNode } from 'react'
import { useAuth } from './AuthProvider';
import { getPendingLogs } from '@/services/queries';
import ModelComponentWithExternalControl from '../common/ModelComponent/ModelComponentWithExternalControl';
import DayEndLogsComponent from '../use-case/DayEndLogsComponent';
import { toast } from 'sonner';

export const DayEndLogContext = createContext(undefined);

export const useDayEndLog = () => {
    const context = useContext(DayEndLogContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

type IProps = {
    children: ReactNode
}

export type ProjectType = {
    projectName: string,
    missingEntries: string[],
    projectId: string
}

const DayEndLogFormProvider: FC<IProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [openDayEndLogModel, setOpenDayEndLogModel] = useState(false);
    const [missingLogs, setMissingLogs] = useState<ProjectType[]>([]);
    const { userData } = useAuth();
    useEffect(() => {
        if (isAuthenticated) {
            if (userData?.userId) {
                getPendingLogs(userData.userId).then(res => {
                    if (res.error || !res.data) {
                        return toast.error("Failed to fetch Pending Logs")
                    }

                    const projectsList: ProjectType[] = res.data[0]?.projects;
                    if (!projectsList) {
                        throw new Error("Something is wrong with the output of edge function");
                    }

                    const projectsWithMissingLogs = projectsList.filter((eachProject) => {
                        const logsArr = eachProject.missingEntries;
                        return logsArr.length > 0;
                    })

                    const isMissing = projectsWithMissingLogs.length > 0;
                    setMissingLogs(projectsWithMissingLogs);
                    setOpenDayEndLogModel(isMissing);
                })
            }
        }

    }, [userData, isAuthenticated]);

    return (
        <DayEndLogContext.Provider value={undefined}>
            {children}
            <ModelComponentWithExternalControl
                modelClassName='sm:max-w-[800px] w-[80vw]'
                open={openDayEndLogModel}
                onOpenChange={(val: boolean) => setOpenDayEndLogModel(val)}
                title='Add Day End Logs'
                description="Add your day's summary here with task name and number of hours"
            >
                <DayEndLogsComponent afterSubmission={() => setOpenDayEndLogModel(false)} missingLogs={missingLogs} />
            </ModelComponentWithExternalControl>
        </DayEndLogContext.Provider>
    )
}

export default DayEndLogFormProvider