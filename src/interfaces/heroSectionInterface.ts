import type { LucideIcon } from "lucide-react";

export interface heroSectionInterface {
    heading: string;
    morqueText: string[];
    subHeading: string;
    buttonText: string;
    heroBannerImage: string;
}

export type Contact = {
    id: number;
    icon: LucideIcon;
    title: string;
    contact: string;
};

export type Available = {
    id: number;
    icon: LucideIcon;
    title: string;
};

export interface WhoWeAreSection {
    title: string;
    heading: string;
    description: string;
    contact: Contact[];
    available: Available[];
    image: string;
}

type ChooseData={
    id:number;
    icon:LucideIcon;
    text:string;
}

export interface Chooseus{
    title:string;
    heading:string;
    buttonText:string;
    chooseUs:ChooseData[];
    image:string;
}

export type FormInputs={
    id:number;
    label:string;
    placeholder:string;
    labelFor:string;
    inputType:string
}

export interface ContactForm{
    title:string;
    heading:string;
    description:string;
    formInputs:FormInputs[];
    buttonText:string;
}
