import AddServices from "../../pages/Service/AddServices/AddServices";
import ServiceOutlet from "../../pages/Service/ServiceOutlet";
import Service from "../../pages/Service/Service";
import ViewService from "../../pages/Service/ViewService";

const ServiceRoute=[
    {
        path:"service",
        Component:ServiceOutlet,
        children:[
            {
                index:true,
                Component:Service
            },
            {
                path:"add-service",
                Component:AddServices
            },
            {
                path:"edit-service/:serviceId",
                Component:AddServices
            },
            {
                path:"view-service/:serviceId",
                Component:ViewService
            }
        ]
    }
]

export default ServiceRoute;
