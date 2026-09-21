import Students from "../../pages/Students/Students";
import AddStudent from "../../pages/Students/Subcomp/AddStudent";
import StudentsMain from "../../pages/Students/Subcomp/StudentsMain";
import ViewStudent from "../../pages/Students/Subcomp/ViewStudent";

const studentRoute=[
    {
        path:"students",
        Component:Students,
        children:[
            {
                index:true,
                Component:StudentsMain
            },
            {
                path:"add-student",
                Component:AddStudent
            },
            {
                path:"edit-student/:id",
                Component:AddStudent
            },
            {
                path:"view-student/:id",
                Component:ViewStudent
            }
        ]
    }
]

export default studentRoute;