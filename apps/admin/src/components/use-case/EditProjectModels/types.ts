/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BasicUser } from "@/pages/EditProject";

export type ComponentProps = {
    name: EditNameProps,
    desc: EditDescProps,
    client: EditClientProps,
}

export type CommonProps = any;

export type EditClientProps = {
    defaultClient: BasicUser;
    getValue: (client: BasicUser) => void;
}

export type EditDescProps = {
    defaultDesc: string;
    getValue: (desc: string) => void;
}

export type EditNameProps = {
    defaultName: string;
    getValue: (name: string) => void;
}
