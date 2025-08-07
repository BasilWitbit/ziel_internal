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
    title: string,
    timeTaken: number
}

const INITIAL_DAY_END_STATE: DayEndLogEntry = {
    type: 'task',
    title: '',
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
}

const SingleDayForm: FC<IProps> = ({ projectName, date, next, projectId }) => {
    const [dayEndValues, setDayEndValues] = useState<DayEndLogEntry>(INITIAL_DAY_END_STATE);
    const [logs, setLogs] = useState<DayEndLogEntry[]>([])
    const [showError, setShowError] = useState(false)
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h1 className='font-bold'>{capitalizeWords(projectName)}</h1>
                <h1>{date}</h1>
            </div>

            <div className='flex flex-col gap-2'>
                <div className="flex gap-4 items-end flex-wrap">
                    <div className="w-full md:w-1/4 min-w-[200px] ">
                        <Input label="Task Name" value={dayEndValues.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setShowError(false);
                            if (dayEndValues.title.length > 50) {
                                return;
                            }
                            setDayEndValues(prevState => ({
                                ...prevState,
                                title: e.target.value
                            }))
                        }} />
                    </div>
                    <div className="w-full md:w-1/4 min-w-[200px] ">
                        <Input label="Time Taken (hours)" type="number" value={dayEndValues.timeTaken} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setShowError(false);
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
                        (Object.keys(dayEndValues) as (keyof DayEndLogEntry)[]).forEach(eachVal => {
                            if (dayEndValues[eachVal] === '') {
                                errors = true
                            }
                        })
                        if (errors) {
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
                {showError ? <p className='text-red-400 text-xs'>All inputs are required</p> : null}
            </div>
            {logs.length > 0 ? <>
                <div className='h-[1px] bg-gray-200 w-full'>&nbsp;</div>
                <div className="flex flex-col gap-2 ">
                    <div className="flex flex-col max-h-[250px] overflow-y-auto">
                        <table className='w-full'>
                            <thead>
                                <tr className='w-full'>
                                    <th align='left'>Title</th>
                                    <th align='center'>Type</th>
                                    <th align='center'>Time Taken (hours)</th>
                                    <th align='center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((eachLog, index) => {
                                    return <tr key={index} className='w-full'>
                                        <td className="max-w-[80px] truncate" align='left'>{capitalizeWords(eachLog.title)}</td>
                                        <td align='center'>{capitalizeWords(eachLog.type)}</td>
                                        <td align='center'>{eachLog.timeTaken}</td>
                                        <td align='center'>
                                            <Button onClick={() => {
                                                const temp = [...logs];
                                                const filteredLogs = temp.filter(eachRow => eachRow.title !== eachLog.title)
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
                    <Button variant={"outline"}>Cancel</Button>
                </div>
            </> : null}

        </div>
    )
}

export default SingleDayForm