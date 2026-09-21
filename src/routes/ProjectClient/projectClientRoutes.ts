import AddClient from "../../pages/ProjectAndClients/ProjectAndClientMain/AddClient";
import ProjectMain from "../../pages/ProjectAndClients/ProjectAndClientMain/ProjectMain";
import ViewProject from "../../pages/ProjectAndClients/ProjectAndClientMain/ViewProject";
import ProjectAndClient from "../../pages/ProjectAndClients/ProjectAndClients";

const projectClientRoutes=[
    {
        path:"project_and_clients",
        Component:ProjectAndClient,
        children:[
           {
            index:true,
            Component:ProjectMain
           },
           {
            path:"add-project",
            Component:AddClient
           },
           {
            path:"view-project/:id",
            Component:ViewProject
           },
           {
            path:"edit-project/:id",
            Component:AddClient
           }
        ]
    }
]

export default projectClientRoutes;