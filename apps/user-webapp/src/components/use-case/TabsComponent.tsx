import React, { type FC } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

type Tab = {
    value: string
    label: string
    content: React.ReactNode
}

type IProps = {
    tabs: Tab[]
}

/**
 * 
 * @param param0 Example usage:
 * <TabsComponent tabs={[{ value: 'account', label: 'Account', content: <AccountComponent /> }, { value: 'password', label: 'Password', content: <PasswordComponent /> }]} />
 * @returns 
 */

const TabsComponent: FC<IProps> = ({ tabs }) => {
    return (
        <Tabs defaultValue={tabs[0].value} className="">
            <TabsList>
                {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                    {tab.content}
                </TabsContent>
            ))}
        </Tabs>
    )
}

export default TabsComponent