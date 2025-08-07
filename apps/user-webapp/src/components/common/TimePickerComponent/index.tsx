import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type IProps = {
    label?: string,
    sideEffects?: (val: string) => void;
}

const TimePickerComponent: React.FC<IProps> = ({ label, sideEffects }) => {
    return (
        <div className="flex flex-col gap-2" >
            {label ? <Label htmlFor="time-picker" className="px-1">
                {label}
            </Label> : null}
            <Input
                type="time"
                id="time-picker"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (sideEffects) {
                        sideEffects(e.target.value)
                    }
                }
                }
                step="60"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
        </div>
    )
}

export default TimePickerComponent;