//import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import type { FC } from "react"
type IProps = {
    title: string,
    children: React.ReactNode
}
const TooltipComponent: FC<IProps> = ({ title, children }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent>
                {title}
            </TooltipContent>
        </Tooltip>
    )
}

export { TooltipComponent }