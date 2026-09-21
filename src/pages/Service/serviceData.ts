export type ServiceRow = {
    id: string;
    name: string;
    category: string;
    status: string;
    created_at: string;
    price: string;
    duration: string;
    bookings: number;
    image: string;
    description: string;
};

export const serviceData: ServiceRow[] = [
    { id: "SVC-001", name: "Drone Mapping", category: "Survey", status: "Active", created_at: "2026-04-01", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80", description: "High precision drone mapping service for land, construction, and planning teams." },
    { id: "SVC-002", name: "Agriculture Scan", category: "Agriculture", status: "Inactive", created_at: "2026-04-03", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1200&q=80", description: "Crop health monitoring and aerial field analysis for agriculture operations." },
    { id: "SVC-003", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-05", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Thermal inspection service for solar, industrial, roofing, and safety use cases." },
    { id: "SVC-004", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-06", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Detailed thermal reporting with aerial imagery and site observations." },
    { id: "SVC-005", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-07", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Inspection workflow for high-risk or difficult-to-access locations." },
    { id: "SVC-006", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-08", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Drone-based thermal scan with practical recommendations." },
    { id: "SVC-007", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-09", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Fast aerial inspection for maintenance and operations teams." },
    { id: "SVC-008", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-10", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Thermal imagery collection and condition assessment." },
    { id: "SVC-009", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-11", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Professional inspection package for commercial clients." },
    { id: "SVC-011", name: "Thermal Inspection", category: "Inspection", status: "Active", created_at: "2026-04-12", price: "$15,000", duration: "2 weeks", bookings: 50, image: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?auto=format&fit=crop&w=1200&q=80", description: "Aerial thermal inspection with structured report delivery." }
];
