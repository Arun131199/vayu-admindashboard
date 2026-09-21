import Courses from "../../pages/Courses/Courses";
import CourseDetails from "../../pages/Courses/details/CourseDetails";
import AddCourse from "../../pages/Courses/main/AddCourse";
import CoursesMain from "../../pages/Courses/main/CoursesMain";

const coursesRoute=[
    {
        path:"courses",
        Component:Courses,
        children:[
            {
                index:true,
                Component:CoursesMain
            },
            {
                path:"add-course",
                Component:AddCourse
            },
            {
                path:"edit-course/:courseId",
                Component:AddCourse
            },
            {
                path:":courseId",
                Component:CourseDetails
            }
        ]
    }
]

export default coursesRoute;
