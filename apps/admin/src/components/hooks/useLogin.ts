/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { loginUser } from '@/store/authSlice'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
type Field = {
    value: string,
    blurred: boolean,
    error: string
}

type FormData = {
    email: Field,
    password: Field
}

const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        email: {
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

    const updateFormValue = (value: string, name: 'email' | 'password') => {
        let temp = { ...formData[name] };
        temp = {
            ...temp,
            value
        }
        setFormData(prevState => ({ ...prevState, [name]: temp }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[useLogin] handleSubmit called - form submission intercepted');
        
        try {
            setLoading(true)
            setErrorMsg(''); // Clear previous errors
            console.log('[useLogin] submit start', formData.email.value);
            await dispatch(
                loginUser({ email: formData.email.value, password: formData.password.value })
            ).unwrap();
            console.log('[useLogin] login SUCCESS - about to show toast');
            toast.success('Login successful! Redirecting...');
            console.log('[useLogin] toast shown, waiting before redirect');
            // small delay to let Redux state propagate & user see success
            setTimeout(() => {
                console.log('[useLogin] navigating to /projects');
                navigate('/projects');
            }, 1000); // Increased delay to see the success message
        } catch (error: any) {
            console.error('[useLogin] login FAILED:', error);
            console.error('[useLogin] error message:', error.message);
            console.error('[useLogin] error response:', error.response?.data);

            // Prefer backend-provided message(s) when present
            let backendMsg = error.response?.data?.message ?? error.response?.data?.error?.message;
            if (Array.isArray(backendMsg)) backendMsg = backendMsg.join(', ');

            // Friendly default for invalid credentials
            const isLogin401 = error.response?.status === 401;
            const message = (typeof error === 'string' ? error : undefined)
                || backendMsg
                || (isLogin401 ? 'Invalid email or password' : error.message)
                || 'Login failed';

            setErrorMsg(message);
            toast.error('Login failed: ' + message);
        } finally {
            setLoading(false)
            console.log('[useLogin] submit end, loading set to false');
        }
    };

    return { formData, updateFormValue, handleSubmit, errorMsg, loading }
}

export default useLogin