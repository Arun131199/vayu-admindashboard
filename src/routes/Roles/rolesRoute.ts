import AddRole from "../../pages/Roles/AddRole";
import Roles from "../../pages/Roles/Roles";

const rolesRoute=[
    {
        path:"roles",
        Component:Roles,
        children:[
            {
                path:'add_role',
                Component:AddRole
            }
        ]
    }
]

export default rolesRoute;