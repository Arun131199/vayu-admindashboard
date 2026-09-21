import { configureStore } from "@reduxjs/toolkit";
import securityReducer from "../slice/securitySlice"

export const store=configureStore({
    reducer:{
        security:securityReducer
    }
})

export type RootState=ReturnType<typeof store.getState>;
export type AppDispatch=typeof store.dispatch;

export default store;
