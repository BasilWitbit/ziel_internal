import type { EditOptions } from '@/pages/EditProject'
import React, { type FC } from 'react'
import EditName from './EditName'
import EditDesc from './EditDesc'
import EditClient from './EditClient'
import EditMembers from './EditMembers'
import type { CommonProps, ComponentProps } from './types'

type IProps = {
    name: EditOptions,
    componentProps?: ComponentProps,
    commonProps?: CommonProps
}

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
    return <div >
        {children}
    </div>
}

const EditModelController: FC<IProps> = ({ name, componentProps, commonProps }) => {
    console.log({ test: componentProps?.name })
    switch (name) {
        case "name":
            return <Layout>
                <EditName
                    {...commonProps}
                    {...componentProps?.name}
                />
            </Layout>
        case "client":
            return <Layout>
                <EditClient
                    {...commonProps}
                    {...componentProps?.client}
                />
            </Layout>
        case "desc":
            return <Layout>
                <EditDesc
                    {...commonProps}
                    {...componentProps?.desc}
                />
            </Layout>
        case "members":
            return <Layout>
                <EditMembers
                    {...commonProps}
                    {...componentProps?.members}
                />
            </Layout>
    }
}

export default EditModelController