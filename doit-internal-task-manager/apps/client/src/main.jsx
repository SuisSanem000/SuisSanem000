import React, {StrictMode} from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.scss'

import {createBrowserRouter, RouterProvider} from "react-router-dom";
import App from './pages/App.jsx'
import ErrorPage from "./pages/ErrorPage.jsx";
import Showcase from "./pages/Showcase.jsx";
import {AppDataProvider} from "./pages/AppDataProvider";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: 'sign-up',
        element: <h1 className="h1-600">Sign up Page</h1>
    },
    {
        path: 'login',
        element: <h1 className="h1-600">Login Page</h1>
    },
    {
        path: 'showcase',
        element: <Showcase/>

    },
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppDataProvider>
            <RouterProvider router={router}/>
        </AppDataProvider>
    </StrictMode>
)
