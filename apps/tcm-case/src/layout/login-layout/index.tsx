import CreateRouter from '../../router/createRouter';
import { routesLoginLayout } from '../../router/config';

export function LoginLayout(props: any): JSX.Element {
  return <CreateRouter {...props} routes={routesLoginLayout} />;
}