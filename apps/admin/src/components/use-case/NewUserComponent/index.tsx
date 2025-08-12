import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, type FC } from 'react'
import { toast } from 'sonner'
import type { UserCategories } from '../UsersComponent/UsersLayout'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router'
import { createUser } from '@/services/mutations'

type FormInput = {
    value: string,
    blurred: boolean,
}

type FormInputVals = {
    firstName: FormInput,
    lastName: FormInput,
    email: FormInput,
}

const NewUserComponent: FC<{
    defaultUserType: UserCategories,
    clientMode?: boolean,
    disableRelocate?: boolean,
    getAddedUserData?: (user: unknown) => void;
}> = ({
    defaultUserType = 'users',
    clientMode,
    disableRelocate,
    getAddedUserData
}) => {
        const [formValues, setFormValues] = useState<FormInputVals>({
            firstName: { value: '', blurred: false },
            lastName: { value: '', blurred: false },
            email: { value: '', blurred: false },
        })

        const [isAdmin, setIsAdmin] = useState(defaultUserType === 'admins');
        const [loading, setLoading] = useState(false);
        const navigate = useNavigate();

        const allBlurred = formValues.firstName.blurred && formValues.email.blurred;
        const allFilled = formValues.firstName.value && formValues.email.value;

        return (
            <form className='flex flex-col gap-6' onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const { firstName, lastName, email } = formValues;

                setLoading(true);

                createUser({
                    firstName: firstName.value,
                    lastName: lastName.value ?? '',
                    email: email.value,
                    isAdmin,
                    isClient: clientMode ? true : false
                }).then((res) => {
                    if (res.error) {
                        toast.error(res.message);
                        setLoading(false);
                    } else {
                        toast.success('User created successfully!');
                        if (getAddedUserData) {
                            getAddedUserData(res.data)
                        }
                        if (!disableRelocate) {
                            setTimeout(() => {
                                navigate(`/users`);
                                setLoading(false);
                            }, 1000)
                        }
                    }
                }).catch((error) => {
                    console.error('Error creating user:', error);
                    toast.error('Failed to create user. Please try again.');
                    setLoading(false);
                });
            }}>
                <div className="flex flex-col flex-wrap md:flex-row gap-2">
                    <div className="max-w-[500px]">
                        <Input required
                            onBlur={() => {
                                setFormValues({ ...formValues, firstName: { ...formValues.firstName, blurred: true } })
                            }}
                            label="First Name"
                            value={formValues.firstName.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFormValues({ ...formValues, firstName: { value: e.target.value, blurred: true } })
                            }}

                        />
                    </div>
                    <div className="max-w-[500px]">
                        <Input
                            onBlur={() => {
                                setFormValues({ ...formValues, lastName: { ...formValues.lastName, blurred: true } })
                            }}
                            label="Last Name (optional)"
                            value={formValues.lastName.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFormValues({ ...formValues, lastName: { value: e.target.value, blurred: true } })
                            }}

                        />
                    </div>
                    <div className="max-w-[500px]">
                        <Input required
                            type="email"
                            onBlur={() => {
                                setFormValues({ ...formValues, email: { ...formValues.email, blurred: true } })
                            }}
                            label="Email"
                            value={formValues.email.value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFormValues({ ...formValues, email: { value: e.target.value, blurred: true } })
                            }}

                        />
                    </div>

                </div>

                {!clientMode && (
                    <div className="flex items-center gap-2">
                        <Checkbox id='isAdmin'
                            checked={isAdmin}
                            onCheckedChange={(checked: boolean) => setIsAdmin(checked)}
                        />
                        <Label htmlFor="isAdmin">Is this an Admin User?</Label>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Button disabled={!(allBlurred && allFilled)} loading={loading} type="submit" className='self-start min-w-[170px]'>
                        Create User
                    </Button>
                </div>
            </form>
        )
    }

export default NewUserComponent
