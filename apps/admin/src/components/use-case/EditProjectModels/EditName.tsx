import React from 'react';
import type { CommonProps, EditNameProps } from './types';

type IProps = CommonProps & EditNameProps

const EditName: React.FC<IProps> = () => {
    return <div>EditName</div>;
};

export default EditName;