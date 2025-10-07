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
import { ScrollArea } from "@/components/ui/scroll-area"

const frameworks = [
    {
        value: "next.js",
        label: "Next.js",
    },
    {
        value: "sveltekit",
        label: "SvelteKit",
    },
    {
        value: "nuxt.js",
        label: "Nuxt.js",
    },
    {
        value: "remix",
        label: "Remix",
    },
    {
        value: "astro",
        label: "Astro",
    },
]

type Option = {
    label: string,
    value: string
}

type IProps = {
    options?: Option[],
    defaultLabel?: string,
    sideEffects?: (val: Option) => void;
    className?: string
    createNewBtn?: CreateNewBtnProps
}

type CreateNewBtnProps = React.ComponentProps<'button'> & {
    label: string,
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    props?: ButtonProps
}

const AutcompleteComponent: React.FC<IProps> = ({ createNewBtn, options = frameworks, defaultLabel, sideEffects, className }) => {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

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
                        : `${defaultLabel ? defaultLabel : "Select Option"}`}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                sideOffset={4}
                collisionPadding={8}
            >
                <Command className="w-full">
                    <CommandInput placeholder="Search..." />
                    <ScrollArea className="max-h-[min(60vh,384px)]">
                        {createNewBtn ? (
                            <div className="px-2 py-2">
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
                            </div>
                        ) : null}

                        <CommandList>
                            <CommandEmpty>No options found</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={`${option.label} ${option.value}`}
                                        onSelect={() => {
                                            setValue(option.value)
                                            sideEffects?.(option)
                                            setOpen(false)
                                        }}
                                    >
                                        <CheckIcon
                                            className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default AutcompleteComponent