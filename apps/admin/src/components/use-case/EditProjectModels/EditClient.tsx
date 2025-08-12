import React from 'react';
import type { CommonProps, EditClientProps } from './types';

type IProps = CommonProps & EditClientProps

const EditClient: React.FC<IProps> = () => {
    return <div>EditClient</div>;
};

export default EditClient;