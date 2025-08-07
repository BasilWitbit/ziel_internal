import React, { type FC } from 'react'
import { useNavigate } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { VariantProps } from 'class-variance-authority'

type IProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean,
        to: string
    }

const LinkedButtonComponent: FC<IProps> = ({ children, to, className, ...props }) => {
    const navigate = useNavigate()

    let target: string | number = to;

    if (to === 'prev') {
        target = -1; // Go back to the previous page
    } else if (to === 'next') {
        target = 1; // Go forward to the next page
    }

    return (
        <Button
            className={cn(className)}
            onClick={() => {
                if (typeof target === 'number') {
                    navigate(target); // history delta
                } else {
                    navigate(target); // path string
                }
            }}
            {...props}
        >
            {children}
        </Button>
    )
}

export default LinkedButtonComponent
