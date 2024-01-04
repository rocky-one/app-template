import { lazy } from 'react';

const Login = lazy(() => import('../pages/login'));
const CarPage = lazy(() => import('../pages/car'));
const CubePage = lazy(() => import('../pages/cube'));
const AmbientLight = lazy(() => import('../pages/ambientLight'));
const DirectionLight = lazy(() => import('../pages/directionLight'));
const PointLight = lazy(() => import('../pages/pointLight'));
const SpecularLight = lazy(() => import('../pages/specularLight'));

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
    path: '/car',
    element: CarPage,
    label: '3D车'
  },
  {
    path: '/cube',
    element: CubePage,
    label: 'CUBE'
  },
  {
    path: '/ambient-light',
    element: AmbientLight,
    label: 'AmbientLight'
  },
  {
    path: '/direction-light',
    element: DirectionLight,
    label: 'DirectionLight'
  },
  {
    path: '/point-light',
    element: PointLight,
    label: 'PointLight'
  },
  {
    path: '/specular-light',
    element: SpecularLight,
    label: 'SpecularLight'
  },
];
