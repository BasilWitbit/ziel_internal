import { Button } from "../ui/button"
import { Input } from "../ui/input"
import useLogin from "../hooks/useLogin"
import zielLogo from "@/assets/Logo.png";

const LoginComponent = () => {
    const {
        formData,
        errorMsg,
        handleSubmit,
        updateFormValue,
        loading
    } = useLogin();

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center items-center">
            <img
                src={zielLogo}
                alt="Ziel Logo"
                className="w-56 mb-8"
                style={{ maxWidth: 300  }}
            />
            <form onSubmit={handleSubmit} className="bg-card border border-gray-200 rounded-lg p-4 w-1/2 min-w-[350px] flex flex-col gap-4 max-w-125">
                <h1 className="text-2xl">Ziel Global Ltd Internal Portal | User</h1>
                <h2 className="text-xl">Login</h2>
                <Input
                    placeholder="Email"
                    value={formData.email.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'email')}
                />
                <Input
                    placeholder="Password"
                    type="password"
                    value={formData.password.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFormValue(e.target.value, 'password')}
                />
                {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
                <Button loading={loading} type="submit">Login</Button>
            </form>
        </div>
    )
}

export default LoginComponent