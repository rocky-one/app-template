import { Button, Form, Input } from 'antd';
import styles from './style.module.less';

export default function Login(props: {
  onLogin: (values: {name: string, password: string}) => void;
}): JSX.Element {

  const onFinish = (values: {name: string, password: string}) => {
    props.onLogin(values);
  }

  return <div className={styles.login}>
    <Form
      name='basic'
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 10 }}
      onFinish={onFinish}
      autoComplete='off'
      style={{width: '420px'}}
    >
      <Form.Item
        label='用户名'
        name='name'
        rules={[{ required: true, message: '请填写用户名!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label='密码'
        name='password'
        rules={[{ required: true, message: '请输入密码!' }]}
      >
        <Input />
      </Form.Item>


      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type='primary' htmlType='submit'>
          登录
        </Button>
      </Form.Item>
    </Form>
    {/* <Button onClick={props.onLogin} type='primary'>登录</Button> */}
  </div>;
}