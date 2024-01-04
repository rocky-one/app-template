import { Button, Form, Input } from 'antd';
import styles from './style.module.less';

export default function Login(props: {
  onLogin: (values: {name: string, password: string}) => void;
}): JSX.Element {

  const onFinish = (values: {name: string, password: string}) => {
    props.onLogin(values);
  };

  return <div className={styles.login}>
    <Form
      autoComplete='off'
      labelCol={{ span: 4 }}
      name='basic'
      onFinish={onFinish}
      style={{width: '420px'}}
      wrapperCol={{ span: 10 }}
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
        <Button htmlType='submit' type='primary'>
          登录
        </Button>
      </Form.Item>
    </Form>
  </div>;
}