import React, { useState, type FormEvent } from 'react';
import type { CommonProps, EditNameProps } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl';
import { capitalizeWords } from '@/utils/helpers';
import ConfirmationBox from '@/components/common/ConfirmationBox';

type IProps = CommonProps & EditNameProps

const EditName: React.FC<IProps> = ({ defaultName }) => {
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [val, setVal] = useState(defaultName)
    return <form onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setConfirmDialog(true)
    }} className='flex flex-col gap-2'>
        <Input
            value={val}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}

            label="Project Name" />
        <Button type="submit">
            Save
        </Button>
        <ModelComponentWithExternalControl title="Are you sure?" open={confirmDialog} onOpenChange={(state) => setConfirmDialog(state)}>
            <ConfirmationBox
                onSelect={(choice) => {
                    console.log({choice})
                    setConfirmDialog(false);
                }}
            title={`Are you sure you wanted to update the project name to ${capitalizeWords(val)}?`}  />

        </ModelComponentWithExternalControl>
    </form>;
};

export default EditName;