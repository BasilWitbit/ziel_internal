import type { ClientUser } from '@/pages/NewProject'
import { type FC } from 'react'
import NewUserComponent from '../../NewUserComponent';

type IProps = {
    getUserDetails: (user: ClientUser) => void;
}

const NewClientModel: FC<IProps> = ({ getUserDetails }) => {
    return (
        <>
            <NewUserComponent
                clientMode={true}
                defaultUserType='users'
                disableRelocate={true}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getAddedUserData={(userData: any) => {
                    getUserDetails({
                        id: `${userData.id}` as string,
                        email: userData.email as string,
                        name: `${userData.firstName as string} ${userData.lastName as string}`.trim()
                    })
                }}
            />
        </>
    )
}

export default NewClientModel
