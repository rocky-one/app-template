import { lazy } from 'react';

const Login = lazy(() => import('../pages/login'));
const CreateCasePage = lazy(() => import('../pages/create-case'));

export const routesLoginLayout = [
  {
    path: '/',
    element: Login,
  },
  {
    path: '/login',
    element: Login,
  },
];

export const baseRoutes = [
  {
    path: '/create-case',
    element: CreateCasePage,
    label: '创建病例',
    auth: ['admin']
  },
  {
    path: '/view-case',
    element: CreateCasePage,
    label: '查看病例',
    auth: ['admin', 'doctor']
  },
];
