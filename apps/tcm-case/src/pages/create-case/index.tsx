import { useState, useEffect } from 'react';
import { Button, Radio, Form, Input, message, Col, Row, Table, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLocation } from 'react-router-dom';
import PrintUI from './printUI';
import * as dayjs from 'dayjs'
import { services, BASE_URL } from '@/services'
import styles from './style.module.less';
import './style.less'

const { Search } = Input;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

type FieldType = {
  name: string;
  gender: string;
  ask?: string;
  pulse?: string;
  needle?: string;
  tcm?: string;
  id?: string;
  time?: number;
  date?: string;
};

function Case(): JSX.Element {

  const [initialValues, setInitialValues] = useState({
    name: '',
    gender: 1,
    ask: '',
    pulse: '',
    needle: '',
    tcm: ''
  });
  const [searchData, setSearchData] = useState([]);
  const [filterData, setFilterData] = useState({ name: '', startDate: 0, endDate: 0});
  const [messageApi, contextHolder] = message.useMessage();
  const [editRow, setEditRow] = useState<FieldType | null>(null);
  const [disabled, setDisabled] = useState(false)
  const [form] = Form.useForm();
  const location = useLocation();

  const info = (text: string) => {
    messageApi.info(text);
  };

  useEffect(() => {
    setDisabled(location.pathname === '/view-case')
  }, [location.pathname]);

  const onSearch = async () => {
    const res = await services.get(`${BASE_URL}/api/search-case`, filterData);
    setSearchData(res.result || [])
    if (!res.result || res.result.length === 0) {
      setEditRow(null)
    }
  }

  const onNameChange = (e: { target: { value: string; }; }) => {
    setFilterData({
      ...filterData,
      name: e.target.value
    })
  }

  const onDateChange = (v) => {
    if (!v) {
      setFilterData({
        ...filterData,
        startDate: 0,
        endDate: 0
      });
      return;
    }
    setFilterData({
      ...filterData,
      startDate: v[0] ? dayjs(v[0].valueOf()).startOf('day').valueOf() : 0,
      endDate: v[1] ? dayjs(v[1].valueOf()).startOf('day').valueOf() : 0
    });
  }

  const onClickReset = () => {
    setSearchData([])
    setEditRow(null)
  }

  const onClickView = (row: FieldType) => {
    form.setFieldsValue(row);
    setEditRow({ ...row });
  }

  const onFinish = async (values: FieldType) => {
    if (!editRow) {
      const res = await services.post(`${BASE_URL}/api/create-case`, values);
      if (res.code === 200) {
        info('病例创建成功!');
      }
    } else {
      const res = await services.post(`${BASE_URL}/api/update-case`, {
        ...values,
        oldName: editRow.name,
        time: editRow.time,
        date: editRow.date
      });
      if (res.code === 200) {
        info('病例更新成功!');
      }
    }

  }

  const columns: ColumnsType<FieldType> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '问诊',
      dataIndex: 'ask',
      key: 'ask',
    },
    {
      title: '脉诊',
      dataIndex: 'pulse',
      key: 'pulse',
    },
    {
      title: '针灸处方',
      dataIndex: 'needle',
      key: 'needle',
    },
    {
      title: '中药处方',
      dataIndex: 'tcm',
      key: 'tcm',
    },
    {
      title: '操作',
      dataIndex: 'op',
      key: 'op',
      render: (_, row) => <Button size='small' onClick={() => onClickView(row)}>查看</Button>,
    },
  ]

  return <div className={`${styles['case-container']} case-container`}>
    <div className={styles['filter']}>
      <Row>
        <Col span={4} style={{ textAlign: 'right' }}>
          <div className={styles['search-text']}>查询：</div>
        </Col>
        <Col span={8}>
          <Search onSearch={onSearch} onChange={onNameChange}/>
        </Col>
        <Col>
          <RangePicker onChange={onDateChange}/>
        </Col>
        <Col span={4}>
          <Button onClick={() => { onSearch() }} type='primary' style={{marginRight: '6px'}}>查询</Button>
          <Button onClick={onClickReset} type='primary'>重置</Button>
        </Col>
      </Row>
      {
        searchData.length > 0 &&
        <div className={styles['table-box']}>
          <Table
            columns={columns}
            dataSource={searchData}
            pagination={{
              pageSize: 2
            }}
            rowKey={(row) => {
              return row.id! || Math.random()
            }}
            size='small'
          />
        </div>
      }
      {contextHolder}
    </div>
    <Form
      name='basic'
      form={form}
      labelCol={{ span: 3 }}
      wrapperCol={{ span: 16 }}
      initialValues={initialValues}
      onFinish={onFinish}
      autoComplete='off'
      disabled={disabled}
    >
      <Form.Item<FieldType>
        label='姓名'
        name='name'
        rules={[{ required: true, message: '请填写姓名!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label='性别'
        name='gender'
        wrapperCol={{ span: 4 }}
        rules={[{ required: true, message: '请选择性别!' }]}
      >
        <Radio.Group>
          <Radio value={1}>男</Radio>
          <Radio value={2}>女</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item<FieldType>
        label='问/望诊'
        name='ask'
      >
        <TextArea rows={6} />
      </Form.Item>

      <Form.Item<FieldType>
        label='脉诊'
        name='pulse'
      >
        <TextArea rows={6} />
      </Form.Item>

      <Form.Item<FieldType>
        label='针灸处方'
        name='needle'
      >
        <TextArea rows={6} />
      </Form.Item>

      <Form.Item<FieldType>
        label='中药处方'
        name='tcm'
      >
        <TextArea rows={6} />
      </Form.Item>


      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type='primary' htmlType='submit'>
          确定
        </Button>
        <PrintUI values={{}} />
      </Form.Item>
    </Form>
  </div>;
}

export default Case;