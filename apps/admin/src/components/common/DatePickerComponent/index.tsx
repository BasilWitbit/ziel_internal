/* eslint-disable react-hooks/exhaustive-deps */

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type IProps = {
    disableNext?: boolean,
    sideEffect?: (date: string) => void,
    label?: string,
}

const DatePickerComponent: React.FC<IProps> = ({ disableNext, sideEffect, label }) => {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)
    React.useEffect(() => {
        if (sideEffect && date) {
            sideEffect(date.toISOString())
        }
    }, [date])
    return (
        <div className="flex flex-col gap-2 w-full">
            {label ? <Label htmlFor="date" className="px-1">
                {label}
            </Label> : null}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="justify-between font-normal border-neutral-200 w-full"
                    >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setDate(date)
                            setOpen(false)
                        }}
                        disabled={(date) => {
                            if (disableNext) {
                                return date > new Date() || date < new Date("1900-01-01")
                            } else {
                                return false;
                            }
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DatePickerComponent