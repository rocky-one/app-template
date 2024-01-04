import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Menu } from 'antd';
import CreateRouter from '../../router/createRouter';
import { baseRoutes } from '../../router/config';
import MenuContainer from './menuContainer';
import ContentContainer from './contentContainer';

export default function BaseLayout(): JSX.Element {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const items = baseRoutes.map(item => ({ ...item, key: item.path }));

  const onClickMenu = (e: { key: string; }): void => {
    navigate(e.key);
  };

  useEffect((): void => {
    setSelectedKeys([location.pathname]);
  }, [location.pathname]);

  return <div style={{ width: '100%', height: '100%', display: 'flex' }}>
    <MenuContainer>
      <Menu
        items={items}
        onClick={onClickMenu}
        selectedKeys={selectedKeys}
        theme='light'
      />
    </MenuContainer>
    <ContentContainer>
      <CreateRouter routes={baseRoutes} />
    </ContentContainer>
  </div>;
}