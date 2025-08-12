import { Button } from '@/components/ui/button'
import { type FC } from 'react'

type IProps = {
    title: string,
    onSelect: (choice: boolean) => void,
}

const ConfirmationBox: FC<IProps> = ({ title, onSelect }) => {
    return (
        <div className='flex flex-col gap-2'>
            <div>
                {title}
            </div>
            <div className='flex gap-2'>
                <Button variant={'secondary'} onClick={() => onSelect(true)}>
                    Yes
                </Button>
                <Button variant={'secondary'} onClick={() => onSelect(false)}>
                    No
                </Button>
            </div>
        </div>
    )
}

export default ConfirmationBox