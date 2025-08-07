import { useState, type FC } from "react"
import type { SingleDayEndType } from "."
import { Progress } from "@/components/ui/progress"
import SingleDayForm, { type DayEndLogEntry } from "./SingleDayForm"
import { groupByProjectNameWithDates } from "./groupProjects"
import { Button } from "@/components/ui/button"
import { addDayEndLogsOfUser } from "@/services/mutations"
import { toast } from "sonner"

type IProps = {
    logs: SingleDayEndType[];
    afterSubmission: () => void;
}

export type LogsPayload = {
    projectName: string;
    projectId: string;
    date: string;
    logs: DayEndLogEntry[];

}

const MultiStepControllerLogs: FC<IProps> = ({ logs, afterSubmission }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<LogsPayload[]>([]);
    const [loading, setLoading] = useState(false);
    console.log({ payload: groupByProjectNameWithDates(data) })
    const currentLog = logs[step];
    return (
        <div className="flex flex-col gap-2">
            <Progress value={((step + 1) / logs.length) * 100} />
            <h2 className="font-semibold">Current Step: <span className="font-normal">{step + 1}/{logs.length}</span></h2>
            {step !== logs.length ? <>
                <SingleDayForm next={(payload) => {
                    const temp = [...data];
                    temp.push(payload);
                    setData(temp);
                    setStep(prevState => prevState + 1);
                }}
                    date={currentLog.date}
                    projectId={currentLog.projectId}
                    projectName={currentLog.projectName} />
            </> : <div className="flex flex-col gap-2">
                <Button disabled={loading} onClick={() => {
                    setLoading(true)
                    const payload = groupByProjectNameWithDates(data);
                    addDayEndLogsOfUser(payload).then((res) => {
                        if (res.error) {
                            return toast.error("Something went wrong, contact admin")
                        }
                        console.log(res.data);
                        toast.success('Successfully Added Day End Logs!');
                        afterSubmission()
                    }).catch(err => {
                        toast.error(err.message ?? "Something went wrong")
                    }).finally(() => setLoading(false));
                }}>Submit</Button>
            </div>}

        </div>
    )
}

export default MultiStepControllerLogs