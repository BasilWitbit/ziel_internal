import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { FC, ReactNode } from "react";

type SingleAccordionItemType = {
    id: string,
    heading: string,
    content: ReactNode
}

const DEFAULT_ACCORDION_CONTENT: SingleAccordionItemType[] = [
    {
        id: 'item-1',
        heading: "Product Information",
        content: <>
            <p>
                Our flagship product combines cutting-edge technology with sleek
                design. Built with premium materials, it offers unparalleled
                performance and reliability.
            </p>
            <p>
                Key features include advanced processing capabilities, and an
                intuitive user interface designed for both beginners and experts.
            </p>
        </>
    },
    {
        id: 'item-2',
        heading: "Shipping Details",
        content: <>
            <p>
                We offer worldwide shipping through trusted courier partners.
                Standard delivery takes 3-5 business days, while express shipping
                ensures delivery within 1-2 business days.
            </p>
            <p>
                All orders are carefully packaged and fully insured. Track your
                shipment in real-time through our dedicated tracking portal.
            </p>
        </>
    },
    {
        id: 'item-3',
        heading: "Return Policy",
        content: <>
            <p>
                We stand behind our products with a comprehensive 30-day return
                policy. If you&apos;re not completely satisfied, simply return the
                item in its original condition.
            </p>
            <p>
                Our hassle-free return process includes free return shipping and
                full refunds processed within 48 hours of receiving the returned
                item.
            </p>
        </>
    },
]

type IProps = {
    list?: SingleAccordionItemType[]
}

const AccordionComponent: FC<IProps> = ({ list = DEFAULT_ACCORDION_CONTENT }) => {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
        >
            {list.map(eachItem => <AccordionItem key={eachItem.id} value={eachItem.id}>
                <AccordionTrigger>{eachItem.heading}</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                    {eachItem.content}
                </AccordionContent>
            </AccordionItem>)}
        </Accordion>
    )
}

export default AccordionComponent