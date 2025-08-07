import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type IProps = {
    label?: string;
    value: string; // Controlled value
    onChange: (val: string) => void; // Handler to update value externally
}

const ControlledTimePickerComponent: React.FC<IProps> = ({ label, value, onChange }) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <Label htmlFor="time-picker" className="px-1">
                    {label}
                </Label>
            )}
            <Input
                type="time"
                id="time-picker"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange(e.target.value);
                }}
                step="60"
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
        </div>
    )
}

export default ControlledTimePickerComponent;
