import { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import type { RouteInterface, CreateRouterProps } from './types';

export default function CreateRouter(wprops: CreateRouterProps): JSX.Element {
  const { routes, ...rest} = wprops;
  return <Suspense fallback={<div>loading</div>}>
      <Routes>
        {routes.map((route: RouteInterface) => (
          <Route
            element={<route.element {...rest} />}
            key={route.path}
            path={route.path}
          />
        ))}
      </Routes>
    </Suspense>;
}