import React from 'react'
import { Link } from 'react-router'

type Iprops = React.ComponentProps<"a"> & { children: React.ReactNode, to: string }

const LinkComponent: React.FC<Iprops> = ({ children, to, ...props }) => {
    return (
        <Link to={to} {...props}>{children}</Link>
    )
}

export default LinkComponent