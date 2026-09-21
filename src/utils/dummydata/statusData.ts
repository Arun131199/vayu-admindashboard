
import { Bookmark, GraduationCap, UsersRound } from "lucide-react";
import type { StatusCardData } from "../StatusCardProps";
export const statusData: StatusCardData[] = [
  {
    id: 1,
    title: "Active Booking",
    value: 24,
    growth: "+8.2%",
    icon:Bookmark
  },
  {
    id: 2,
    title: "Total Users",
    value: 120,
    growth: "-5.1%",
    icon:UsersRound
  },
  {
    id:3,
    title:"Courses Enrolled",
    value:89,
    growth:"+23.1%",
    icon:GraduationCap
  }
];

