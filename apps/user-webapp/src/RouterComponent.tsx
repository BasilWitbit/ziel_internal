import {
    createBrowserRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useLocation,
} from "react-router";
import type { FC } from "react";

import Login from "./pages/Login";
import { useAuth } from "./components/context/AuthProvider";
import BaseLayout from "./components/use-case/BaseLayout";
import { PAGES } from "./utils/constants";
import FirstTimePassword from "./pages/FirstTimePassword";

const ProtectedRoute: FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
    const location = useLocation();
    const { userData } = useAuth();  // Assuming this returns { isNew, ... }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userData?.isNewUser) {
        return <Navigate to="/first-time-password" replace />;
    }

    // 🟢 Allow access to /first-time-password or any page if isNew is false
    return (
        <BaseLayout>
            <Outlet />
        </BaseLayout>
    );
};



// ✅ Shows login, or redirects if already logged in
const LoginRelocate: FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
    const location = useLocation();

    if (isAuthenticated) {
        // After login, go back to where user came from (if any), or to /home
        const from = location.state?.from?.pathname || "/home";
        return <Navigate to={from} replace />;
    }

    return <Login />;
};

// ✅ Builds dynamic router
const router = (isAuthenticated: boolean) =>
    createBrowserRouter([
        {
            path: "/login",
            element: <LoginRelocate isAuthenticated={isAuthenticated} />,
        },
        {
            element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
            children: [
                ...PAGES.map((eachPage) => ({
                    path: eachPage.path,
                    element: eachPage.element,
                })),

            ],

        },
        {
            path: "/first-time-password",
            element: <FirstTimePassword />,
        },
        {
            path: "*",
            element: <Navigate to={isAuthenticated ? "/home" : "/login"} replace />,
        },
    ]);

// ✅ Wrapper that injects router based on auth
const RouterComponent = () => {
    const auth = useAuth();
    return <RouterProvider router={router(auth.isAuthenticated)} />;
};

export default RouterComponent;
