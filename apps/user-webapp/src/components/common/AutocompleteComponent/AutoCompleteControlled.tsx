import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type Option = {
    label: string
    value: string
}

type CreateNewBtnProps = React.ComponentProps<'button'> & {
    label: string
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    props?: ButtonProps
}

type IProps = {
    options?: Option[]
    value: string
    onValueChange: (value: string, option: Option) => void
    defaultLabel?: string
    className?: string
    createNewBtn?: CreateNewBtnProps
}

const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
]

const AutocompleteControlled: React.FC<IProps> = ({
    value,
    onValueChange,
    options = frameworks,
    defaultLabel,
    className,
    createNewBtn
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between border-neutral-200 font-normal", className)}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : defaultLabel || "Select Option"}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command className="w-full">
                    <CommandInput placeholder="Search..." />
                    {createNewBtn ? (
                        <Button
                            onClick={(e) => {
                                setOpen(false)
                                createNewBtn.onClick(e)
                            }}
                            {...createNewBtn.props}
                            className={cn("w-[90%] mx-auto", createNewBtn.props?.className)}
                        >
                            {createNewBtn.label}
                        </Button>
                    ) : null}
                    <CommandList>
                        <CommandEmpty>No options found</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={`${option.label} ${option.value}`}
                                    onSelect={() => {
                                        setOpen(false)
                                        onValueChange(option.value, option)
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default AutocompleteControlled
