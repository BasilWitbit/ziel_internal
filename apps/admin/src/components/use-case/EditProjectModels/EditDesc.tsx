import React from 'react';
import type { CommonProps, EditDescProps } from './types';


type IProps = CommonProps & EditDescProps

const EditDesc: React.FC<IProps> = () => {
    return <div>EditDesc</div>;
};

export default EditDesc;