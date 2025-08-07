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

// ✅ Protects all authenticated pages
const ProtectedRoute: FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

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
        // After login, go back to where user came from (if any), or to /projects
        const from = location.state?.from?.pathname || "/projects";
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
            children: PAGES.map((eachPage) => ({
                path: eachPage.path,
                element: eachPage.element,
            })),
        },
        // {
        //     path: "/verify",
        //     element: <FirstTimePassword />, // 👈 You'll build this component
        // },
        {
            path: "*",
            element: <Navigate to={isAuthenticated ? "/projects" : "/login"} replace />,
        },
    ]);

// ✅ Wrapper that injects router based on auth
const RouterComponent = () => {
    const auth = useAuth();
    return <RouterProvider router={router(auth.isAuthenticated)} />;
};

export default RouterComponent;
