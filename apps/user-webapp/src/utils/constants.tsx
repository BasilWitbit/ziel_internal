import Home from "@/pages/Home"
import { HomeIcon } from "lucide-react"
// import FullPageCalendar from "@/components/common/FullCalanderComponent/FullPageCalendar"
import type React from "react"

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
        name: 'home',
        path: "/home",
        heading: 'Home',
        element: <Home />,
        icon: <HomeIcon />,
        inNav: true,
    },
    // {
    //     name: 'calendar',
    //     path: "/calendar",
    //     heading: 'Calendar',
    //     element: <FullPageCalendar />,
    //     icon: <CalendarIcon />,
    //     inNav: true,
    // },
]