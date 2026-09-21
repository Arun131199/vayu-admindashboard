import type { LucideIcon } from "lucide-react";
import type { MouseEventHandler } from "react";

export interface loginProps{
    username:string;
    password:string;
}

export interface buttonProps{
    buttonText?:string;
    varient?:string;
    icon?:LucideIcon;
    onClick?:MouseEventHandler<HTMLButtonElement>;
    type?:"button" | "submit" | "reset";
}
