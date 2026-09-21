import BookingAndEnquiry from "../../pages/BookingAndEnquiry/BookingAndEnquiry";
import BookingMain from "../../pages/BookingAndEnquiry/subComponent/BookingMain";
import ViewBookingEnquiry from "../../pages/BookingAndEnquiry/ViewBookingEnquiry";
import EditBookingEnquiry from "../../pages/BookingAndEnquiry/EditBookingEnquiry";

const bookingAndEnquiryRoute=[
    {
        path:"booking_enquiry",
        Component:BookingAndEnquiry,
        children:[
            {
                index:true,
                Component:BookingMain
            },
            {
                path:"view-booking/:id",
                Component:ViewBookingEnquiry
            },
            {
                path:"edit-booking/:id",
                Component:EditBookingEnquiry
            }
        ]
    }
]

export default bookingAndEnquiryRoute;