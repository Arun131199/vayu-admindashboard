export type studentProps={
    id:string|number;
    name:string;
    email:string;
    phone_number:string;
    course:string;
    enrollment_date:string;
    status:string;
    progress:number;
    emergency_contact:string;
    address:string;
    notes:string
}



const studentData:studentProps[] = [
    {
        id: 1,
        name: "Arun Kumar",
        email: "arun.kumar@email.com",
        phone_number: "+91 98765 43210",
        course: "Drone Pilot Training",
        enrollment_date: "2023-01-15",
        status: "Active",
        progress: 75,
        emergency_contact: "+91 98765 00000",
        address: "123 Main Street, Chennai, India",
        notes: "Excellent practical flying skills."
    },
    {
        id: 2,
        name: "Vikram Singh",
        email: "vikram.singh@email.com",
        phone_number: "+91 91234 56789",
        course: "Aerial Mapping Course",
        enrollment_date: "2023-02-10",
        status: "Completed",
        progress: 100,
        emergency_contact: "+91 90000 11111",
        address: "45 Lake View Road, Bangalore, India",
        notes: "Completed certification successfully."
    },
    {
        id: 3,
        name: "Rahul Sharma",
        email: "rahul.sharma@email.com",
        phone_number: "+91 99887 66554",
        course: "Drone Repair & Maintenance",
        enrollment_date: "2023-03-05",
        status: "Active",
        progress: 60,
        emergency_contact: "+91 98888 12345",
        address: "78 MG Road, Hyderabad, India",
        notes: "Needs improvement in hardware diagnostics."
    },
    {
        id: 4,
        name: "Sneha Reddy",
        email: "sneha.reddy@email.com",
        phone_number: "+91 93456 78901",
        course: "Agriculture Drone Operations",
        enrollment_date: "2023-04-18",
        status: "Dropped",
        progress: 40,
        emergency_contact: "+91 90012 34567",
        address: "12 Green Avenue, Coimbatore, India",
        notes: "Paused training due to personal reasons."
    },
    {
        id: 5,
        name: "Karthik Raj",
        email: "karthik.raj@email.com",
        phone_number: "+91 95678 12345",
        course: "Drone Pilot Training",
        enrollment_date: "2023-05-22",
        status: "Active",
        progress: 82,
        emergency_contact: "+91 94444 22222",
        address: "90 Anna Nagar, Madurai, India",
        notes: "Strong performance in simulation tests."
    },
    {
        id: 6,
        name: "Priya Nair",
        email: "priya.nair@email.com",
        phone_number: "+91 97865 43219",
        course: "Survey & Inspection Training",
        enrollment_date: "2023-06-11",
        status: "Completed",
        progress: 100,
        emergency_contact: "+91 97777 88888",
        address: "14 Palm Street, Kochi, India",
        notes: "Top scorer in final assessment."
    },
    {
        id: 7,
        name: "Ajay Verma",
        email: "ajay.verma@email.com",
        phone_number: "+91 90123 45678",
        course: "Drone Cinematography",
        enrollment_date: "2023-07-01",
        status: "Active",
        progress: 55,
        emergency_contact: "+91 95555 66666",
        address: "67 Film City, Mumbai, India",
        notes: "Creative aerial video projects submitted."
    },
    {
        id: 8,
        name: "Meena Iyer",
        email: "meena.iyer@email.com",
        phone_number: "+91 92345 67890",
        course: "Industrial Drone Safety",
        enrollment_date: "2023-08-14",
        status: "Active",
        progress: 68,
        emergency_contact: "+91 96666 55555",
        address: "3 Temple Road, Trichy, India",
        notes: "Very punctual and disciplined student."
    },
    {
        id: 9,
        name: "Suresh Babu",
        email: "suresh.babu@email.com",
        phone_number: "+91 98701 23456",
        course: "Drone Pilot Training",
        enrollment_date: "2023-09-09",
        status: "Dropped",
        progress: 25,
        emergency_contact: "+91 91111 22222",
        address: "88 Beach Road, Pondicherry, India",
        notes: "Attendance issues reported."
    },
    {
        id: 10,
        name: "Divya Patel",
        email: "divya.patel@email.com",
        phone_number: "+91 94567 89012",
        course: "Aerial Mapping Course",
        enrollment_date: "2023-10-20",
        status: "Completed",
        progress: 100,
        emergency_contact: "+91 93333 44444",
        address: "21 River Side, Pune, India",
        notes: "Excellent mapping and GIS knowledge."
    }
];

export default studentData;