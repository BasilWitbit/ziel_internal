import AutocompleteControlled from '@/components/common/AutocompleteComponent/AutoCompleteControlled'
import ControlledTimePickerComponent from '@/components/common/TimePickerComponent/ControlledTimePickerComponent'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { TeamMember } from '@/pages/NewProject'
import { useUserStore } from '@/store/userStore'
import { Label } from '@radix-ui/react-label'
import React, { useState, type FC } from 'react'


const INITIAL_USER_ENTRY_STATE = {
    id: '',
    role: '',
    startTime: '',
    endTime: '',
    overlappingHoursRequired: 0,
    requiresReporting: true
}

type IProps = {
    getUser: (member: TeamMember) => void;
    alreadyExistsError: boolean
}

const AddTeamMemberModel: FC<IProps> = ({ getUser, alreadyExistsError }) => {
    const { users } = useUserStore();
    const [userEntry, setUserEntry] = useState<TeamMember>(INITIAL_USER_ENTRY_STATE);
    const isInvalid = !userEntry.id || !userEntry.role || !userEntry.startTime || !userEntry.endTime || userEntry.overlappingHoursRequired === null
    return (
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            getUser(userEntry);
        }} className='flex flex-col gap-2'>
            <div className="flex gap-2 flex-wrap items-end">
                <div className="flex w-full flex-col gap-2">
                    <Label >Select User</Label>
                    <AutocompleteControlled
                        value={userEntry.id}
                        onValueChange={(val) => {
                            setUserEntry(prevState => ({
                                ...prevState,
                                id: val
                            }))
                        }}
                        // className='max-w-full'
                        defaultLabel='Search for Users'
                        options={[...users.map(eachUser => ({ value: `${eachUser.id}`, label: eachUser.name }))]}

                    />
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Input label="Add Role"
                        // className='max-w-[200px]'
                        value={userEntry.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserEntry(prevState => ({
                                ...prevState,
                                role: e.target.value
                            }))
                        }}
                    />
                </div>

            </div>
            <div className="flex gap-2 flex-wrap items-end">
                <div className="flex w-full flex-col gap-2">
                    <Label >Start Time (in PKT)</Label>
                    <ControlledTimePickerComponent value={userEntry.startTime} onChange={(val) => {
                        setUserEntry(prevState => ({
                            ...prevState,
                            startTime: val
                        }))
                    }} />
                </div>
                <div className="flex w-full flex-col gap-2">
                    <Label >End Time (in PKT)</Label>
                    <ControlledTimePickerComponent value={userEntry.endTime} onChange={(val) => {
                        setUserEntry(prevState => ({
                            ...prevState,
                            endTime: val
                        }))
                    }} />
                </div>
            </div>
            <div className="flex gap-2 flex-wrap items-end">
                <div className="flex w-full flex-col gap-2">
                    <Input label="Overlapping Hours Required"
                        type="number"
                        // className='max-w-[200px]'
                        value={userEntry.overlappingHoursRequired}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setUserEntry(prevState => ({
                                ...prevState,
                                overlappingHoursRequired: +e.target.value
                            }))
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id='requiresReporting'
                        checked={userEntry.requiresReporting}
                        onCheckedChange={(checked: boolean) => setUserEntry(prevState => ({
                            ...prevState,
                            requiresReporting: checked
                        }))}
                    />
                    <Label htmlFor="requiresReporting">Is this user Required to Report?</Label>
                </div>
            </div>
            {alreadyExistsError ? <p className='text-destructive'>User is already added, please select another user</p> : null}
            <Button type="submit" disabled={isInvalid}>Add Team Member</Button>
        </form>
    )
}

export default AddTeamMemberModel