import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { LoginLayout } from './layout/login-layout';
import BaseLayout from './layout/base-layout';

const users = {
  admin: {
    password: '123',
    auth: 'admin',
    path: '/create-case'
  },
  doctor: {
    password: '123',
    auth: 'doctor',
    path: '/view-case'
  }
}

function App(): JSX.Element {
  const [login, setLogin] = useState(localStorage.getItem('user') !== null);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const onLogin = (data): void => {
    if (users[data.name] && users[data.name].password === data.password) {
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        auth: users[data.name].auth
      }));
      navigate(users[data.name].path);
      setLogin(true)
    } else {
      messageApi.error('用户名或密码错误!');
    }
  };
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user || location.pathname === '/login') {
      setLogin(false)
      navigate('/login');
    }
  }, [login, navigate, location.pathname]);

  if (!login) {
    return <>
      <LoginLayout onLogin={onLogin} />
      {contextHolder}
    </>;
  }
  return <BaseLayout />;
}
export default App;


