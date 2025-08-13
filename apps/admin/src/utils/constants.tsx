const env = import.meta.env

import NewProject from "@/pages/NewProject"
import NewUser from "@/pages/NewUser"
import Projects from "@/pages/Projects"
import SingleTimelog from "@/pages/SingleTimelog"
// import Timelogs from "@/pages/Timelogs"
import Users from "@/pages/Users"
import UserLogs from "@/pages/UserLogs"
import { User, UserPlus, Clock, Workflow, LayoutDashboard, PackageCheck, PackageOpen, UsersIcon } from "lucide-react"
import type React from "react"
import EditProject from "@/pages/EditProject"
import EditTeamMembers from "@/pages/EditTeamMembers"

export const SUPABASE_PROJECT_URL = env.VITE_SUPABASE_PROJECT_URL as string
export const SUPABASE_DB_PASS = env.VITE_SUPABASE_DB_PASSWORD as string
export const SUPABASE_ACCESS_TOKEN = env.VITE_SUPABASE_ACCESS_TOKEN as string
export const SUPABASE_API_KEY = env.VITE_SUPABASE_API_KEY as string
export const SUPABASE_SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;
export const SUPABASE_EDGE_BASE_URL = env.VITE_SUPABASE_EDGE_BASE_URL as string;

export const NEW_USER_PASS = env.VITE_NEW_USER_PASS as string;

export type Page = {
    path: string,
    heading: string,
    element: React.ReactNode,
    icon: React.ReactNode,
    name: string,
    inNav?: boolean
}

export const selectPageByName = (name: string): Page | undefined => {
    return PAGES.find((page) => page.name === name);
}

export const PAGES: Page[] = [
    {
        name: 'users',
        path: "/users",
        heading: 'All Users',
        element: <Users />,
        icon: <User />,
        inNav: true,
    },
    {
        name: 'create-user',
        path: "/users/new",
        heading: 'Create New User',
        element: <NewUser />,
        icon: <UserPlus />,
        inNav: true
    },
    {
        name: 'user-logs',
        path: "/user-logs",
        heading: 'User Logs',
        element: <UserLogs />,
        icon: <Clock />
    },
    // {
    //     name: 'timelogs',
    //     path: "/timelogs",
    //     heading: 'All Timelogs',
    //     element: <Timelogs />,
    //     icon: <Clock />,
    //     inNav: true
    // },
    {
        name: 'single-timelog',
        path: "/timelogs/:id",
        heading: 'Single Timelog',
        element: <SingleTimelog />,
        icon: <Workflow />
    },
    {
        name: 'projects',
        path: "/projects",
        heading: 'All Projects',
        element: <Projects />,
        icon: <LayoutDashboard />,
        inNav: true
    },
    {
        name: 'create-project',
        heading: 'Create New Project',
        path: "/projects/new",
        element: <NewProject />,
        icon: <PackageCheck />,
        inNav: true
    },
    {
        name: 'edit-project',
        heading: 'Edit Project',
        path: "/project/:id/edit",
        element: <EditProject />,
        icon: <PackageOpen />,
        inNav: false
    },
    {
        name: 'edit-team-members',
        heading: 'Edit Team Members',
        path: "/project/:id/team/edit",
        element: <EditTeamMembers />,
        icon: <UsersIcon />, // or something more appropriate like <Workflow /> or <Users />
        inNav: false
    }
]