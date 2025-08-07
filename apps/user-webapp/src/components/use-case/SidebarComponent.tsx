import { LogOutIcon } from "lucide-react"
import { SidebarGroupComponent, type Item } from './SidebarGroupComponent';
import { useAuth } from '../context/AuthProvider';
import { Sidebar, SidebarContent } from "../ui/sidebar";
import { PAGES } from "@/utils/constants";

type MenuItemType = {
    title: string,
    items: Item[]
}

const SideBarComponent = () => {
    const { logout } = useAuth();
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

