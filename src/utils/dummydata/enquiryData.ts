import type { EnquiryRow } from "../EnquiryProps";

export const enquiryData: EnquiryRow[] = [
  {
    id: "ENQ001",
    name: "Sanjay Patel",
    email: "sanjay.p@email.com",
    phone: "+91 98111 22333",
    service: "Agricultural Survey",
    message: "Interested in drone survey for 50-acre farmland.",
    date: "2026-04-02",
    status: "New"
  },
  {
    id: "ENQ002",
    name: "Arun Kumar",
    email: "arun.k@email.com",
    phone: "+91 98765 43210",
    service: "Land Mapping",
    message: "Need detailed mapping for construction planning.",
    date: "2026-04-03",
    status: "Pending"
  },
  {
    id: "ENQ003",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    phone: "+91 91234 56789",
    service: "Inspection Service",
    message: "Looking for site inspection using drones.",
    date: "2026-04-04",
    status: "New"
  },
  {
    id: "ENQ004",
    name: "Rahul Verma",
    email: "rahul.v@email.com",
    phone: "+91 99887 66554",
    service: "Agricultural Survey",
    message: "Crop health monitoring required.",
    date: "2026-04-05",
    status: "Closed"
  },
  {
    id: "ENQ005",
    name: "Meena Iyer",
    email: "meena.i@email.com",
    phone: "+91 90011 22334",
    service: "3D Mapping",
    message: "Need 3D terrain model for project.",
    date: "2026-04-06",
    status: "Pending"
  },
  {
    id: "ENQ006",
    name: "Karthik R",
    email: "karthik.r@email.com",
    phone: "+91 93456 78901",
    service: "Survey Analysis",
    message: "Looking for data analysis after survey.",
    date: "2026-04-07",
    status: "New"
  },
  {
    id: "ENQ007",
    name: "Anita Singh",
    email: "anita.s@email.com",
    phone: "+91 92345 67890",
    service: "Land Inspection",
    message: "Inspection required before purchase.",
    date: "2026-04-08",
    status: "Closed"
  },
  {
    id: "ENQ008",
    name: "Vikram Joshi",
    email: "vikram.j@email.com",
    phone: "+91 91122 33445",
    service: "Drone Survey",
    message: "Survey needed for mining site.",
    date: "2026-04-09",
    status: "Pending"
  },
  {
    id: "ENQ009",
    name: "Sneha Nair",
    email: "sneha.n@email.com",
    phone: "+91 92233 44556",
    service: "Agricultural Survey",
    message: "Want irrigation analysis.",
    date: "2026-04-10",
    status: "New"
  },
  {
    id: "ENQ010",
    name: "Rohit Gupta",
    email: "rohit.g@email.com",
    phone: "+91 93344 55667",
    service: "Mapping Service",
    message: "Need high-resolution mapping.",
    date: "2026-04-11",
    status: "Closed"
  }
] as const;