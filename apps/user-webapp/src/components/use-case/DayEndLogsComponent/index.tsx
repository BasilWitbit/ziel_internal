//import type { ProjectType } from "@/components/context/DayEndLogFormProvider"
{/*import type { FC } from "react"
import MultiStepControllerLogs from "./MultiStepControllerLogs"
type IProps = {
    missingLogs: ProjectType[],
    afterSubmission: () => void;
}

export type SingleDayEndType = {
    projectName: string,
    projectId: string,
    date: string
}

const DayEndLogsComponent: FC<IProps> = ({ missingLogs, afterSubmission }) => {
    let logs: SingleDayEndType[] = [];
    for (let i = 0; i < missingLogs.length; i++) {
        const projectName = missingLogs[i].projectName;
        const projectId = missingLogs[i].projectId;
        logs = [...logs, ...missingLogs[i].missingEntries.map(eachDate => ({
            projectName,
            projectId,
            date: eachDate
        }))]
    }
    return (
        <>
            <MultiStepControllerLogs afterSubmission={afterSubmission} logs={logs} />
        </>
    )
}

export default DayEndLogsComponent*/}