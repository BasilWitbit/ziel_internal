/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useAuth } from '../context/AuthProvider'
type Field = {
    value: string,
    blurred: boolean,
    error: string
}

type FormData = {
    username: Field,
    password: Field
}

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        username: {
            value: '',
            blurred: false,
            error: ''
        },
        password: {
            value: '',
            blurred: false,
            error: ''
        },
    })

    const [errorMsg, setErrorMsg] = useState('');

    const updateFormValue = (value: string, name: 'username' | 'password') => {
        let temp = { ...formData[name] };
        temp = {
            ...temp,
            value
        }
        setFormData(prevState => ({ ...prevState, [name]: temp }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true)
            await login(formData.username.value, formData.password.value);
            // navigate("/projects"); // Redirect to protected page
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false)
        }
    };



    return { formData, updateFormValue, handleSubmit, errorMsg, loading }
}

export default useLogin