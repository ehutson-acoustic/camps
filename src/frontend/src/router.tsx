// src/router.tsx
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import App from './App';
import EmployeeDetail from '@/pages/EmployeeDetail';
import NotFound from '@/pages/NotFound';
import AdminDashboard from "@/pages/admin/AdminDashboard.tsx";
import EmployeeAdmin from "@/pages/admin/EmployeeAdmin.tsx";
import TeamAdmin from "@/components/layout/TeamAdmin.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
    },
    {
        path: '/employee/:employeeId',
        element: <EmployeeDetail/>,
    },
    {
        path: '/admin',
        element: <AdminDashboard/>
    },
    {
        path: '/admin/employees',
        element: <EmployeeAdmin/>
    },
    {
        path: '/admin/teams',
        element: <TeamAdmin/>
    },
    {
        path: '*',
        element: <NotFound/>,
    },
]);

export function Router() {
    return <RouterProvider router={router}/>;
}