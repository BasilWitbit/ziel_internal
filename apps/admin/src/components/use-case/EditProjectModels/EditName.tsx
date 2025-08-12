import React, { useState, type FormEvent } from 'react';
import type { CommonProps, EditNameProps } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
type IProps = CommonProps & EditNameProps

const EditName: React.FC<IProps> = ({ defaultName, getValue }) => {
    const [val, setVal] = useState(defaultName)
    return <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        getValue(val);
    }} className='flex flex-col gap-2'>
        <Input
            value={val}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}

            label="Project Name" />
        <Button type="submit">
            Save
        </Button>
    </form>;
};

export default EditName;