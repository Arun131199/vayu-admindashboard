import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import mainRoute from './routes/mainRoute.ts'
import { AuthProvider } from './context/AuthContext'
import { Provider } from 'react-redux'
import store from "./redux/store/store.ts"
import { Toaster } from "sonner"

const router = createBrowserRouter(mainRoute)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster duration={3000} position='top-right' richColors closeButton />
      </Provider>
    </AuthProvider>
  </StrictMode>,
)
