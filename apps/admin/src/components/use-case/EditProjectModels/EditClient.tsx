/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import type { CommonProps, EditClientProps } from './types';
import type { BasicUser } from '@/pages/EditProject';
import { capitalizeWords } from '@/utils/helpers';
import AutocompleteControlled from '@/components/common/AutocompleteComponent/AutoCompleteControlled';
import { getUsers } from '@/services/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ModelComponentWithExternalControl from '@/components/common/ModelComponent/ModelComponentWithExternalControl';
import NewClientModel from '../NewProjectComponent/multi/NewClientModel';

type IProps = CommonProps & EditClientProps

const EditClient: React.FC<IProps> = ({ defaultClient, getValue }) => {
    const [openNewClientModel, setOpenNewClientModel] = useState(false);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<BasicUser[]>([]);
    const [selectedClient, setSelectedClient] = useState<BasicUser>(defaultClient);
    useEffect(() => {
        getUsers().then((res) => {
            if (!res.error && res.data) {
                const mappedUsers = res.data.map((user: any) => ({
                    email: user.email ?? "",
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    id: user.id
                }));
                setUsers(mappedUsers);
                const defaultUser = mappedUsers.find(eachUser => `${defaultClient.id}` === `${eachUser.id}`);
                if (defaultUser) {
                    setSelectedClient({
                        email: defaultUser.email,
                        firstName: defaultUser.firstName,
                        lastName: defaultUser.lastName,
                        id: defaultUser.id
                    });
                }
            }
        }).catch().finally(() => setLoading(false));
    }, []);
    const initials = `${(defaultClient.firstName?.[0] ?? "").toUpperCase()}${(defaultClient.lastName?.[0] ?? "").toUpperCase()}`
    return <>
        {loading ? <>
            {/* proper skeleton for loading state */}
            <div className="animate-pulse flex flex-col gap-2">
                <Skeleton />
                <Skeleton className="h-4 bg-muted rounded w-1/2" />
                <Skeleton className="h-4 bg-muted rounded w-3/4" />
            </div>
        </> : <div className='flex flex-col gap-2'>
            <h3 className=''>Selected Client:</h3>
            <div className='flex flex-col gap-1'>
                <div className="flex items-center gap-3 text-left">
                    <div className="size-8 grid place-items-center rounded-full bg-muted text-xs font-medium">
                        {initials}
                    </div>
                    <div className="text-sm">
                        <div className="font-medium leading-none">
                            {capitalizeWords(`${selectedClient.firstName ?? ""} ${selectedClient.lastName ?? ""}`.trim()) || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{selectedClient.email || "—"}</div>
                    </div>
                </div>
            </div>
            <AutocompleteControlled

                value={selectedClient.id} onValueChange={(val: string) => {
                    const newUser = users.find(user => user.id === val);
                    if (newUser) {
                        setSelectedClient(newUser);
                    }
                }}
                createNewBtn={{
                    label: "Add new client",
                    onClick: () => {
                        setOpenNewClientModel(true);
                    },
                    props: {
                        className: 'my-2'
                    },
                }}
                options={users.map(eachUser => ({
                    label: capitalizeWords(`${eachUser.firstName ?? ""} ${eachUser.lastName ?? ""}`.trim()) || "—",
                    value: eachUser.id
                }))} />
            <Button variant="default" onClick={() => {
                getValue({
                    email: selectedClient.email,
                    firstName: selectedClient.firstName,
                    lastName: selectedClient.lastName,
                    id: selectedClient.id
                })
            }}>Save Client</Button>
        </div >
        }
        <ModelComponentWithExternalControl
            open={openNewClientModel}
            onOpenChange={(change) => setOpenNewClientModel(change)}
            title="Add New Client"
        >
            <NewClientModel
                getUserDetails={(user) => {
                    const newUser = {
                        email: user.email ?? "",
                        firstName: user.name.split(' ')[0] ?? "",
                        lastName: user.name.split(' ')[1] ?? "",
                        id: `${user.id}`
                    };
                    setSelectedClient(newUser);
                    const tempUsers = [...users];
                    setUsers([...tempUsers, newUser]);
                    setOpenNewClientModel(false);
                }}
            />
        </ModelComponentWithExternalControl>
    </>;
};

export default EditClient;