import Products from "../../pages/Products/Products";
import AddProduct from "../../pages/Products/ProductsMain/AddProduct";
import ProductsMain from "../../pages/Products/ProductsMain/ProductMain";

const productRoutes=[
    {
        path:"products",
        Component:Products,
        children:[
            {
                index:true,
                Component:ProductsMain
            },
            {
                path:"add-new-product",
                Component:AddProduct
            },
            {
                path:"edit-product/:id",
                Component:AddProduct
            }
        ]
    }
]

export default productRoutes;