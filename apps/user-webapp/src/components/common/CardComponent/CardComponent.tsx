import { cn } from '@/lib/utils'
import React, { type FC } from 'react'

type IProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string
}

const CardComponent: FC<IProps> = ({ children, className, ...props }) => {
    return (
        <div className={cn('bg-white p-4 rounded-lg shadow-md', className)} {...props}>
            {children}
        </div>
    )
}

export default CardComponent