import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FC, ReactNode } from "react"

type ModelComponentWithExternalControlProps = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    description?: string,
    children: ReactNode
}

const ModelComponentWithExternalControl: FC<ModelComponentWithExternalControlProps> = ({ open, onOpenChange, title, description, children }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
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
