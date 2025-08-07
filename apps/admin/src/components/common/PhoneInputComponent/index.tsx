import { Input } from '@/components/ui/input'
import type { FC, InputHTMLAttributes, ChangeEvent } from 'react'

type PhoneInputProps = {
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void,
    label?: string,
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>

const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    const part1 = digits.slice(0, 4)
    const part2 = digits.slice(4)
    return part2 ? `${part1}-${part2}` : part1
}

const PhoneInputComponent: FC<PhoneInputProps> = ({
    value,
    onChange,
    label,
    ...props
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const formatted = formatPhone(raw)

        // Build a new synthetic event with the formatted value
        const formattedEvent = {
            ...e,
            target: {
                ...e.target,
                value: formatted,
            },
        }

        onChange(formattedEvent as ChangeEvent<HTMLInputElement>)
    }

    return (
        <Input
            label={label}
            {...props}
            value={value}
            onChange={handleChange}
            type="tel"
            placeholder="03XX-XXXXXXX"
            inputMode="numeric"
        />
    )
}

export default PhoneInputComponent
