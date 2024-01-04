import { Button } from 'antd';
import styles from './style.module.less';

export default function Login(props: {
  onLogin: () => void;
}): JSX.Element {
  return <div className={styles.login}>
    <Button onClick={props.onLogin} type='primary'>登录</Button>
  </div>;
}