export interface CreateRouterProps {
  routes: RouteInterface[],
}

export interface RouteInterface {
  path: string,
  element: React.ComponentType,
  routes?: RouteInterface[],
}
