import { Button } from "../ui/button"
import { Input } from "../ui/input"
import useLogin from "../hooks/useLogin"

const LoginComponent = () => {
    const {
        formData,
        errorMsg,
        handleSubmit,
        updateFormValue,
    } = useLogin();

    return (
        <div className="min-h-screen bg-background flex justify-center items-center">
            <form onSubmit={handleSubmit} className="bg-card border border-gray-200 rounded-lg p-4 w-1/2 min-w-[350px] flex flex-col gap-4 max-w-125">
                <h1 className="text-2xl">Login</h1>
                <Input
                    placeholder="Email"
                    value={formData.username.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'username')}
                />
                <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'password')}
                />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <Button type="submit">Login</Button>
            </form>
        </div>
    )
}

export default LoginComponent