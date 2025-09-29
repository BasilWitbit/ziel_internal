import { LogOutIcon } from "lucide-react"
import { SidebarGroupComponent, type Item } from './SidebarGroupComponent';
import { Sidebar, SidebarContent } from "../ui/sidebar";
import { PAGES } from "@/utils/constants";
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { logout as logoutAction } from '@/store/authSlice';

type MenuItemType = {
    title: string,
    items: Item[]
}

const SideBarComponent = () => {
    const dispatch = useDispatch<AppDispatch>();
    const logout = () => dispatch(logoutAction());
    const buildPages = PAGES.filter(page => page.inNav).map(page => ({
        name: page.name,
        title: page.heading,
        action: {
            type: "url" as const,
            target: page.path
        },
        icon: page.icon
    }));

    // Use pages from PAGES (order and presence of calendar are controlled in `src/utils/constants.tsx`)
    const buildPagesWithCalendar = buildPages;
        const menu: MenuItemType[] = [
        {
            title: 'Pages',
            items: buildPagesWithCalendar
        },
        {
            title: 'User',
            items: [
                {
                    name: 'sign-out',
                    title: "Sign Out",
                    action: {
                        type: "button",
                        clickHandler: () => {
                            logout();
                        }
                    },
                    icon: <LogOutIcon />,
                },
            ]
        },
    ]
    return (
        <Sidebar>
            <SidebarContent>
                {menu.map(eachMenuItem => {
                    return <SidebarGroupComponent key={eachMenuItem.title} label={eachMenuItem.title} options={eachMenuItem.items} />
                })}
            </SidebarContent>
        </Sidebar >
    )
}

export default SideBarComponent

