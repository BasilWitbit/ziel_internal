import { useState, type FC } from "react"
import type { SingleDayEndType } from "."
import { Progress } from "@/components/ui/progress"
import SingleDayForm, { type DayEndLogEntry } from "./SingleDayForm"
import { groupByProjectNameWithDates } from "./groupProjects"
import { Button } from "@/components/ui/button"
import { addDayEndLogsOfUser } from "@/services/mutations"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

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
    const currentLog = logs[step];

    const handleBack = () => {
        if (step > 0) {
            // // Remove the last entry from data when going back
            // const temp = [...data];
            // temp.pop();
            // setData(temp);
            setStep(prevState => prevState - 1);
        }
    };

    const handleNext = (payload: LogsPayload) => {
        const temp = [...data];
        if (step < data.length) {
            temp[step] = payload;
        }
        else {
            temp.push(payload);
        }
        setData(temp);
        setStep(prevState => prevState + 1);
    };

    return (
        <div className="flex flex-col gap-2">
            <Progress value={((step + 1) / logs.length) * 100} />
            {step !== logs.length && (
                <>
                    {step > 0 && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBack}
                            className="self-start"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Go back
                        </Button>
                    )}
                    <h2 className="font-semibold">Current Step: <span className="font-normal">{step + 1}/{logs.length}</span></h2>
                </>
            )}
            {step !== logs.length ? <>
                <SingleDayForm
                    key={`${currentLog.projectId}-${currentLog.date}`}
                    next={handleNext}
                    date={currentLog.date}
                    projectId={currentLog.projectId}
                    projectName={currentLog.projectName}
                    initialLogs={data[step]?.logs || []}
                    onCancel={afterSubmission}
                />
            </> : <div className="flex flex-col gap-2">
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Review and Submit</h3>
                    <p className="text-sm text-gray-600">You have completed {logs.length} logs. Click submit to save all entries or go back to make changes.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={loading}
                    >
                        Back to Edit
                    </Button>
                    <Button loading={loading} onClick={() => {
                        setLoading(true)
                        const payload = groupByProjectNameWithDates(data);
                        addDayEndLogsOfUser(payload).then((res) => {
                            if (res.error) {
                                return toast.error("Something went wrong, contact admin")
                            }
                            toast.success('Successfully Added Day End Logs!');
                            afterSubmission()
                        }).catch(err => {
                            toast.error(err.message ?? "Something went wrong")
                        }).finally(() => setLoading(false));
                        console.log(groupByProjectNameWithDates(data))
                    }}>Submit All Logs</Button>
                </div>
            </div>}

        </div>
    )
}

export default MultiStepControllerLogs