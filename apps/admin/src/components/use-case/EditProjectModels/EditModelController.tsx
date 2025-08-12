import type { EditOptions } from '@/pages/EditProject'
import React, { type FC } from 'react'
import EditName from './EditName'
import EditDesc from './EditDesc'
import EditClient from './EditClient'
import EditMembers from './EditMembers'
import type { CommonProps, ComponentProps } from './types'

type IProps = {
    name: EditOptions,
    componentProps: ComponentProps,
    commonProps: CommonProps
}

const EditModelController: FC<IProps> = ({ name, componentProps, commonProps }) => {
    switch (name) {
        case "name":
            return <EditName
                {...commonProps}
                {...componentProps.name}
            />
        case "client":
            return <EditClient
                {...commonProps}
                {...componentProps.client}
            />
        case "desc":
            return <EditDesc
                {...commonProps}
                {...componentProps.desc}
            />
        case "members":
            return <EditMembers
                {...commonProps}
                {...componentProps.members}
            />
    }
}

export default EditModelController