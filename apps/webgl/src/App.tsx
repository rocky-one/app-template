import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginLayout } from './layout/login-layout';
import BaseLayout from './layout/base-layout';

function App(): JSX.Element {
  const [login, setLogin] = useState(localStorage.getItem('login') === 'true');
  const navigate = useNavigate();
  const onLogin = (): void => {
    localStorage.setItem('login', 'true');
    setLogin(true);
  };
  useEffect(() => {
    if (!login) {
      navigate('/login');
    }
  }, [login, navigate]);

  if (!login) {
    return <LoginLayout onLogin={onLogin} />;
  }
  return <BaseLayout />;
}
export default App;


