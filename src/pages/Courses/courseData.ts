export type CourseWeekPlan = {
    id: number;
    week: string;
    topics: string[];
};

export type CourseRow = {
    id: string;
    course_name: string;
    category: string;
    course_image: string;
    duration: string;
    price: string;
    lectures: number;
    curriculum: CourseWeekPlan[];
    status: string;
    created_at: string;
};  


export const courseData: CourseRow[] = [
    {
        id: "COUR-001",
        course_name: "Basic Drone Pilot Training",
        category: "Pilot Training",
        course_image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1200&q=80",
        duration: "4 weeks",
        price: "Rs. 12,000",
        lectures: 18,
        curriculum: [
            {
                id: 1,
                week: "Week 1",
                topics: ["Drone basics", "Safety rules", "Regulations and permissions"]
            },
            {
                id: 2,
                week: "Week 2",
                topics: ["Flight controls", "Take-off and landing", "Simulator practice"]
            },
            {
                id: 3,
                week: "Week 3",
                topics: ["Manual flying", "Emergency handling", "Mission planning"]
            },
            {
                id: 4,
                week: "Week 4",
                topics: ["Field assessment", "Camera operation", "Final practical test"]
            }
        ],
        status: "Active",
        created_at: "2026-04-10"
    },
    {
        id: "COUR-002",
        course_name: "Advanced Mapping and Survey",
        category: "Survey",
        course_image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
        duration: "6 weeks",
        price: "Rs. 18,500",
        lectures: 24,
        curriculum: [
            {
                id: 1,
                week: "Week 1",
                topics: ["Survey fundamentals", "Mission objectives", "Site planning"]
            },
            {
                id: 2,
                week: "Week 2",
                topics: ["Waypoint creation", "Ground control points", "Field checklist"]
            },
            {
                id: 3,
                week: "Week 3",
                topics: ["Data capture", "Overlap settings", "Terrain awareness"]
            },
            {
                id: 4,
                week: "Week 4",
                topics: ["Photogrammetry basics", "Map stitching", "Accuracy checks"]
            },
            {
                id: 5,
                week: "Week 5",
                topics: ["Report generation", "Client deliverables", "QA review"]
            },
            {
                id: 6,
                week: "Week 6",
                topics: ["Live survey project", "Team presentation", "Final evaluation"]
            }
        ],
        status: "Active",
        created_at: "2026-04-14"
    },
    {
        id: "COUR-003",
        course_name: "Drone Maintenance Essentials",
        category: "Maintenance",
        course_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
        duration: "3 weeks",
        price: "Rs. 9,500",
        lectures: 12,
        curriculum: [
            {
                id: 1,
                week: "Week 1",
                topics: ["Drone parts overview", "Battery care", "Pre-flight inspection"]
            },
            {
                id: 2,
                week: "Week 2",
                topics: ["Motor and propeller checks", "Firmware updates", "Troubleshooting"]
            },
            {
                id: 3,
                week: "Week 3",
                topics: ["Repair basics", "Maintenance logbook", "Service best practices"]
            }
        ],
        status: "Inactive",
        created_at: "2026-04-20"
    }
];
