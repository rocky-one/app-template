import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from 'antd';

const PrintUI = (props: { values: any }) => {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current!,
  });

  return (
    <div>
      <div ref={componentRef}>1111222</div>
      <Button onClick={handlePrint}>打印</Button>
    </div>
  );
};

export default PrintUI;