import SelectComponentControlled, { type Option } from '@/components/common/SelectComponentControlled'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { capitalizeWords } from '@/utils/helpers'
import { Delete, PlusIcon } from 'lucide-react'
import React, { useState, type FC } from 'react'
import type { LogsPayload } from './MultiStepControllerLogs'


type EntryTypes = 'meeting' | 'task' | 'bug'

export type DayEndLogEntry = {
    type: EntryTypes,
    featureTitle: string,
    timeTaken: number,
    taskDescription: string
}

const INITIAL_DAY_END_STATE: DayEndLogEntry = {
    type: 'task',
    featureTitle: '',
    taskDescription: '',
    timeTaken: 0
}

const entryTypeOptions: Option<EntryTypes>[] = [
    {
        label: "Meeting",
        value: 'meeting'
    },
    {
        label: "Task",
        value: 'task'
    },
    {
        label: "Bug",
        value: 'bug'
    }
]



type IProps = {
    projectName: string;
    date: string;
    next: (payload: LogsPayload) => void;
    projectId: string;
    initialLogs?: DayEndLogEntry[];
    onCancel?: () => void;
}

const SingleDayForm: FC<IProps> = ({ projectName, date, next, projectId, initialLogs = [], onCancel }) => {
    const [dayEndValues, setDayEndValues] = useState<DayEndLogEntry>(INITIAL_DAY_END_STATE);
    const [logs, setLogs] = useState<DayEndLogEntry[]>(initialLogs)
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h1 className='font-bold'>{capitalizeWords(projectName)}</h1>
                <h1>{date}</h1>
            </div>

            <div className='flex flex-col gap-2'>
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="w-full md:w-1/4 min-w-[200px] ">
                        <Input label="Feature Title" value={dayEndValues.featureTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setShowError(false);
                            setErrorMessage('');
                            if (dayEndValues.featureTitle.length > 50) {
                                return;
                            }
                            setDayEndValues(prevState => ({
                                ...prevState,
                                featureTitle: e.target.value
                            }))
                        }} />
                    </div>
                    <div className="w-full min-w-[200px] ">
                        <Input required label="Task Description*" value={dayEndValues.taskDescription} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setShowError(false);
                            setErrorMessage('');
                            if (dayEndValues.taskDescription.length > 50) {
                                return;
                            }
                            setDayEndValues(prevState => ({
                                ...prevState,
                                taskDescription: e.target.value
                            }))
                        }} />
                    </div>
                    <div className="w-full md:w-1/4 min-w-[200px] ">
                        <Input label="Time Taken (hours)" type="number" value={dayEndValues.timeTaken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setShowError(false);
                            setErrorMessage('');
                            setDayEndValues(prevState => ({
                                ...prevState,
                                timeTaken: +e.target.value
                            }))
                        }} />
                    </div>
                    <div className="w-full md:w-1/4 min-w-[200px] ">
                        <SelectComponentControlled label="Select Type of Entry" handleChange={(selectedType) => {
                            setDayEndValues(prevState => ({ ...prevState, type: selectedType as EntryTypes }))
                        }} options={entryTypeOptions} placeholder='Select Type of Entry' value={dayEndValues.type} />

                    </div>
                    <Button size='icon' onClick={() => {
                        // validate
                        let errors = false;
                        let errorMsg = '';

                        if (!dayEndValues.taskDescription.trim()) {
                            errors = true;
                            errorMsg = 'Feature title is required';
                        } else if (dayEndValues.timeTaken < 0.1) {
                            errors = true;
                            errorMsg = 'Time taken must be at least 0.1 hours';
                        }

                        if (errors) {
                            setErrorMessage(errorMsg);
                            return setShowError(true)
                        }
                        setShowError(false);
                        setLogs(prevState => [...prevState, dayEndValues]);
                        setDayEndValues(INITIAL_DAY_END_STATE);
                    }}
                        disabled={showError}
                    >
                        <PlusIcon />
                    </Button>
                </div>
                {showError ? <p className='text-red-400 text-xs'>{errorMessage}</p> : null}
            </div>
            {logs.length > 0 ? <>
                <div className='h-[1px] bg-gray-200 w-full'>&nbsp;</div>
                <div className="flex flex-col gap-2 ">
                    <div className="flex flex-col max-h-[250px] overflow-y-auto">
                        <table className='w-full'>
                            <thead>
                                <tr className='w-full'>
                                    <th align='left'>Feature Title</th>
                                    <th align='left'>Task Description</th>
                                    <th align='center'>Type</th>
                                    <th align='center'>Time Taken (hours)</th>
                                    <th align='center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((eachLog, index) => {
                                    return <tr key={index} className='w-full'>
                                        <td className="max-w-[80px] truncate" align='left'>{capitalizeWords(eachLog.featureTitle)}</td>
                                        <td align='center'>{capitalizeWords(eachLog.taskDescription)}</td>
                                        <td align='center'>{eachLog.type}</td>
                                        <td align='center'>{eachLog.timeTaken}</td>
                                        <td align='center'>
                                            <Button onClick={() => {
                                                const temp = [...logs];
                                                const filteredLogs = temp.filter(eachRow => eachRow.featureTitle !== eachLog.featureTitle)
                                                setLogs(filteredLogs);
                                            }} variant={"ghost"} size='icon'>
                                                <Delete />
                                            </Button>
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Button onClick={() => {
                        next({
                            projectName,
                            date,
                            logs,
                            projectId
                        })
                        setLogs([]);
                    }}>Save Logs for the Day</Button>
                    <Button variant={"outline"} onClick={onCancel}>Cancel</Button>
                </div>
            </> : null}

        </div>
    )
}

export default SingleDayForm