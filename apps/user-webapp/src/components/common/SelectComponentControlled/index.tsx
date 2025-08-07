import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { type FC } from 'react'

export type Option<K = string> = {
    value: K,
    label: string
}

type IProps = {
    placeholder: string,
    value: string,
    options: Option[],
    handleChange: (selectedVal: string) => void;
    handleBlur?: (blurredVal: string) => void;
    label?: string;
    id?: string
}

const SelectComponentControlled: FC<IProps> = ({ placeholder, value, options, handleBlur, handleChange, label, id }) => {
    const getId = React.useId()
    const inputId = id ?? getId
    return (
        <div className='flex flex-col gap-1 w-full'>
            {label && (
                <Label
                    htmlFor={inputId}
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                    {label}
                </Label>
            )}
            <Select
                defaultValue={value}
                onValueChange={(val) => handleChange(val)}
            >
                <SelectTrigger className="w-full" onBlur={() => {
                    if (handleBlur) {
                        handleBlur(value)
                    }
                }}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent id={inputId}>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

    )
}

export default SelectComponentControlled