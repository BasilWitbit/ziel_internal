import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React, { type FC } from 'react'

export type Option<K = string> = {
  value: K
  label: string
}

type IProps = {
  placeholder: string
  value: string
  options: Option[]
  handleChange: (selectedVal: string) => void
  handleBlur?: (blurredVal: string) => void
  label?: string
  id?: string
}

const SelectComponentControlled: FC<IProps> = ({ placeholder, value, options, handleBlur, handleChange, label, id }) => {
  const getId = React.useId()
  const inputId = id ?? getId

  // Debug props to ensure correct values are passed
  console.log('SelectComponentControlled Props:', { value, options, placeholder })

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </Label>
      )}
      <Select
        value={value} // Use value for controlled behavior
        onValueChange={(val) => {
          console.log('Selected value:', val) // Debug selection
          handleChange(val)
        }}
        onOpenChange={(open) => console.log('Dropdown open state:', open)} // Debug dropdown open/close
      >
        <SelectTrigger className="w-full" onBlur={() => handleBlur?.(value)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent id={inputId}>
          {options.length === 0 ? (
            <SelectItem value="no-options" disabled>
              No projects available
            </SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

export default SelectComponentControlled