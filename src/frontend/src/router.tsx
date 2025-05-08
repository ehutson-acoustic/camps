// src/router.tsx
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import App from './App';
import EmployeeDetail from '@/pages/EmployeeDetail';
import NotFound from '@/pages/NotFound';

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
        path: '*',
        element: <NotFound/>,
    },
]);

export function Router() {
    return <RouterProvider router={router}/>;
}