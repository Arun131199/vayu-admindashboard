import type { LucideIcon } from "lucide-react";

export interface StatusCardData  {
  id:number;
  title:string;
  value?:string|number;
  growth?:string|number;
  icon?:LucideIcon;
  
}

export interface StatusCardProps{
    data:StatusCardData[];
    gridcount?:  1 | 2 | 3 | 4 | 5 | 6;
    loading?: boolean;
    skeletonCount?: number;
}
