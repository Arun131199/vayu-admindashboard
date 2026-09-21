import AddTestimonial from "../../pages/WebSettings/AddTestimonial";
import Gallery from "../../pages/WebSettings/Gallery";
import HomePage from "../../pages/WebSettings/HomePage";
import NotificationSettings from "../../pages/WebSettings/NotificationSettings";
import SecuritySettings from "../../pages/WebSettings/SecuritySettings";
import Testimonial from "../../pages/WebSettings/Testimonial";
import ViewTestimonial from "../../pages/WebSettings/ViewTestimonial";
import Websettings from "../../pages/WebSettings/Websettings";

const webSettingsRoute=[
    {
        path:"web-settings",
        Component:Websettings,
        children:[
            {
                index:true,
                Component:HomePage
            },
            {
                path:"home",
                Component:HomePage
            },
            {
                path:"notification",
                Component:NotificationSettings
            },
            {
                path:"security",
                Component:SecuritySettings
            },
            {
                path:"gallery",
                Component:Gallery
            },
            {
                path:"testimonials",
                Component:Testimonial
            },
            {
                path:"testimonials/view_testimonials/:id?",
                Component:ViewTestimonial
            },
            {
                path:"testimonials/add_testimonials",
                Component:AddTestimonial
            },
            {
                path:"testimonials/edit_testimonial/:id?",
                Component:AddTestimonial
            },
            
        ]
    }
]

export default webSettingsRoute;