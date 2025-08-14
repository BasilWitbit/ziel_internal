import React, { useState, type FormEvent } from 'react';
import type { CommonProps, EditDescProps } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
type IProps = CommonProps & EditDescProps

const EditDesc: React.FC<IProps> = ({ defaultDesc, getValue }) => {
    const [val, setVal] = useState(defaultDesc)
    return <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        getValue(val);
    }} className='flex flex-col gap-2'>
        <Textarea className='max-h-[40vh]'
            value={val}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVal(e.target.value)}
            rows={3}
            label="Project Description" />
        <Button type="submit">
            Save
        </Button>
    </form>;
};

export default EditDesc;