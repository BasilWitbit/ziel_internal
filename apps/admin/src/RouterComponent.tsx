import {
    createBrowserRouter,
    Navigate,
    Outlet,
    RouterProvider,
    useLocation,
} from "react-router";
import type { FC } from "react";
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { fetchUser } from '@/store/authSlice';
import { getAccessToken } from '@/utils/storage';

import Login from "./pages/Login";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import BaseLayout from "./components/use-case/BaseLayout";
import { PAGES } from "./utils/pages";

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
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => !!state.auth.user);
    const [bootstrapped, setBootstrapped] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            dispatch(fetchUser()).finally(() => setBootstrapped(true));
        } else {
            setBootstrapped(true);
        }
    }, [dispatch]);

    if (!bootstrapped) {
        return <div className="w-full h-screen flex items-center justify-center">Initializing...</div>;
    }

    return <RouterProvider router={router(isAuthenticated)} />;
};

export default RouterComponent;
