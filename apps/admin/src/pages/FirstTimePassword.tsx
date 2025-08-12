import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'react-router';

const FirstTimePassword = () => {
    const [params] = useSearchParams();
    const [formData, setFormData] = useState({
        password: { value: '', blurred: false },
        confirmPassword: { value: '', blurred: false },
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [exchangeError, setExchangeError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const token = params.get("token");
    const type = params.get("type");

    // Step 1: Exchange token for session
    useEffect(() => {
        const exchange = async () => {
            if (token && type === "invite") {
                const { error } = await supabase.auth.exchangeCodeForSession(token);
                if (error) {
                    setExchangeError("Token is invalid or expired.");
                }
            }
        };
        exchange();
    }, [token, type]);

    const updateFormValue = (value: string, name: 'password' | 'confirmPassword') => {
        setFormData(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value
            }
        }));
    };

    const validate = () => {
        const newErrors: string[] = [];
        const { password, confirmPassword } = formData;

        if (!password.value || !confirmPassword.value) {
            newErrors.push('Both fields are required.');
        }

        if (
            password.blurred &&
            confirmPassword.blurred &&
            password.value &&
            confirmPassword.value &&
            password.value !== confirmPassword.value
        ) {
            newErrors.push('Passwords do not match.');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleBlur = (name: 'password' | 'confirmPassword') => {
        setFormData(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                blurred: true
            }
        }));
        validate();
    };

    const disableBtn =
        loading ||
        !formData.password.value ||
        !formData.confirmPassword.value ||
        errors.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: formData.password.value,
        });

        setLoading(false);

        if (error) {
            setErrors([error.message]);
        } else {
            setSuccess(true);
        }
    };

    if (exchangeError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                <p>{exchangeError}</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-green-600 text-lg">✅ Password created! You can now log in.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex justify-center items-center">
            <form
                onSubmit={handleSubmit}
                className="bg-card border border-gray-200 rounded-lg p-4 w-1/2 min-w-[350px] flex flex-col gap-4 max-w-125"
            >
                <h1 className="text-2xl">Create new password</h1>
                <Input
                    placeholder="Create Password"
                    type="password"
                    value={formData.password.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'password')}
                    onBlur={() => handleBlur('password')}
                />
                <Input
                    placeholder="Confirm Password"
                    type="password"
                    value={formData.confirmPassword.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'confirmPassword')}
                    onBlur={() => handleBlur('confirmPassword')}
                />
                {errors.map((err, i) => (
                    <p key={i} className="text-red-500 text-sm">
                        {err}
                    </p>
                ))}
                <Button disabled={disableBtn} type="submit" loading={loading}>
                    Create Password
                </Button>
            </form>
        </div>
    );
};

export default FirstTimePassword;
