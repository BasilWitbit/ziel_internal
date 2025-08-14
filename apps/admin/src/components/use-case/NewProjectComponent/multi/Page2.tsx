import AutcompleteComponent from '@/components/common/AutocompleteComponent'
import CardComponent from '@/components/common/CardComponent/CardComponent'
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ClientUser } from '@/pages/NewProject'
import { CircleMinus } from 'lucide-react'
import { useEffect, useState, type FC } from 'react'
import NewClientModel from './NewClientModel'
import { useUserStore } from '@/store/userStore'

type IProps = {
    next: ((user: ClientUser) => void),
    back: () => void,
    defaultSelectedUserId?: string
}

const INITIAL_CLIENT = {
    id: '',
    name: '',
    email: ''
}

const Page2: FC<IProps> = ({ next, back, defaultSelectedUserId }) => {
    const { users, addUser } = useUserStore();
    const [selectedClient, setSelectedClient] = useState<ClientUser>(INITIAL_CLIENT)
    const [openNewClientModel, setOpenNewClientModel] = useState<boolean>(false);

    useEffect(() => {
        const defaultUser = users.find(eachUser => `${defaultSelectedUserId}` === `${eachUser.id}`)
        if (defaultUser) {
            setSelectedClient(defaultUser)
        }
    }, [])

    return (
        <section className='flex flex-col gap-5'>
            <h1 className='font-bold text-xl'>Client Information</h1>
            <div className=""><Button variant={'outline'} className='min-w-[100px]' onClick={back}>Back</Button></div>
            <div className="flex gap-2 flex-col">
                <div className="flex flex-col gap-3">
                    <Label >Select Client</Label>
                    <div className="flex gap-2">
                        <AutcompleteComponent createNewBtn={{
                            label: "Add new client",
                            onClick: () => {
                                setOpenNewClientModel(true);
                            },
                            props: {
                                className: 'my-2'
                            },
                        }}
                            className='max-w-[200px]'
                            defaultLabel='Search for Users'
                            options={[...users.map(eachUser => ({ value: `${eachUser.id}`, label: eachUser.name }))]}
                            sideEffects={(val) => {
                                const userSelected = users.find(eachUser => eachUser.id === val.value);
                                if (userSelected) {
                                    setSelectedClient(userSelected)
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 flex-col">
                        {selectedClient.id ? <>
                            <p className='font-semibold text-lg'>
                                Selected Client:
                            </p>
                            <div className="flex flex-col gap-3">
                                <CardComponent className="flex gap-4 items-center">
                                    <Button size="icon" onClick={() => {
                                        setSelectedClient(INITIAL_CLIENT)
                                    }} className='bg-primary cursor-pointer'>
                                        <CircleMinus />
                                    </Button>
                                    <div className="flex flex-col gap-1">
                                        <p>{selectedClient.name}</p>
                                        <p>{selectedClient.email}</p>
                                    </div>
                                </CardComponent>
                                <Button className='w-[120px] bg-primary' onClick={() => {
                                    next(selectedClient)
                                }}>Save Client</Button>
                            </div>
                        </> : null}
                    </div>
                </div>
            </div>
            <ModelComponentWithExternalControl
                open={openNewClientModel}
                onOpenChange={(change) => setOpenNewClientModel(change)}
                title="Add New Client"
            >
                <NewClientModel
                    getUserDetails={(user) => {
                        setSelectedClient(user)
                        addUser(user);
                        setOpenNewClientModel(false);
                    }}
                />
            </ModelComponentWithExternalControl>
        </section >
    )
}

export default Page2