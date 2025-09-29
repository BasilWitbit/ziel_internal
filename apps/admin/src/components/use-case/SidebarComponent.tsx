import { LogOutIcon } from "lucide-react"
import { SidebarGroupComponent, type Item } from './SidebarGroupComponent';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { logout as logoutAction } from '@/store/authSlice';
import { Sidebar, SidebarContent } from "../ui/sidebar";
import { PAGES } from "@/utils/pages";

type MenuItemType = {
    title: string,
    items: Item[]
}

const SideBarComponent = () => {
    const dispatch = useDispatch<AppDispatch>();
    const buildPages = PAGES.filter(page => page.inNav).map(page => ({
        name: page.name,
        title: page.heading,
        action: {
            type: "url" as const,
            target: page.path
        },
        icon: page.icon
    }));
    const menu: MenuItemType[] = [
        {
            title: 'Pages',
            items: buildPages
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
                            dispatch(logoutAction());
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

