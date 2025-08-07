import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { FC, ReactNode } from "react"

type ModelComponentWithExternalControlProps = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    description?: string,
    children: ReactNode,
    modelClassName?: string
}

const ModelComponentWithExternalControl: FC<ModelComponentWithExternalControlProps> = ({ open, onOpenChange, title, description, children, modelClassName }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("sm:max-w-[425px] max-h-[95vh]", modelClassName ?? '')}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>
                        {description}
                    </DialogDescription> : null}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}

export default ModelComponentWithExternalControl
