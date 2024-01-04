import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from 'antd';
import styles from './style.module.less';

function PrintUI(props: { values: any }) {
  const { values } = props;
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current!,
  });

  return (
    <>
      <div
        ref={componentRef}
        style={{
          marginTop: '900px'
          // position: 'fixed',
          // zIndex: -10
        }}
      >
        <table className={styles.table}>
          <colgroup style={{width: '100px'}} />
          <colgroup style={{width: '200px'}} />
          <colgroup style={{width: '100px'}} />
          <colgroup style={{width: '200px'}} />
          <colgroup style={{width: '100px'}} />
          <colgroup style={{width: '200px'}} />
          <tbody>
            <tr>
              <td>姓名</td>   <td>{values.name}</td>
              <td>年龄</td>   <td>{values.age}</td>
              <td>来诊日期</td>   <td>{values.formatTime}</td>
            </tr>
            <tr>
              <td>针灸处方</td>
              <td colSpan={5}>
                <textarea readOnly value={values.needle}/>
              </td>
            </tr>
            <tr>
              <td>中药处方</td>
              <td colSpan={5}>
                <textarea readOnly value={values.tcm}/>
              </td>
            </tr>
            <tr>
              <td>说明</td>
              <td colSpan={5}>
                <textarea readOnly value={values.desc}/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Button onClick={handlePrint}>打印</Button>
    </>
  );
}

export default PrintUI;