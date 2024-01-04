import { useEffect, useRef, useState } from 'react';
import { Button, ColorPicker } from 'antd';
import { SceneManager } from "../../components/cars/sceneManager";
import styles from './style.module.less';
import { useObervable } from '@/hooks/useObservable';


function Demo(): JSX.Element {
  const [manageInstance, setManageInstance] = useState<SceneManager>();
  const carRef = useRef<SceneManager | null>();

  useEffect(() => {
    const container = document.getElementById('carContainer');
    const manage = new SceneManager({
      container: container!,
    });
    manage.on(manage.events.loaded, () => {
      const doorInfoEle =  document.getElementById('doorInfo');
      const doorInfo3Ele =  document.getElementById('doorInfo3');
      if (doorInfoEle && doorInfo3Ele) {
        manage.cssRender.create2DObject('后备箱', doorInfoEle);
        const object3d = manage.cssRender.create3DObject('右前门', doorInfo3Ele);
        object3d.rotateY(Math.PI);
      }
    });
    setManageInstance(manage);
    
    return () => {
      manageInstance?.destroy();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  const data = useObervable(manageInstance!, manageInstance ? [manageInstance.events.loaded] : []);
  useEffect(() => {
    console.log(data, 999);
  }, [data]);

  return <div className={styles['car-container']}>
    <div className={styles.tools}>
      <div className={styles['door-info']} id="doorInfo">
        <div className={styles.container}>
        比亚迪宋可以说就是比亚迪S3的双模版车型，外观方面其采用了X型的前脸，显得颇为运动。车身侧面，新车采用了隐藏式的A/B/C柱设计。
        </div>
      </div>
      <div className={`${styles['door-info']} ${styles['door-info3']}`} id="doorInfo3">
        <div className={styles.container}>
        比亚迪宋可以说就是比亚迪S3的双模版车型，外观方面其采用了X型的前脸，显得颇为运动。车身侧面，新车采用了隐藏式的A/B/C柱设计。
        </div>
      </div>
      <Button onClick={() => { carRef.current?.animationManager?.openCarLight();}} type='primary'>开车灯</Button> <br />
      <Button onClick={() => {carRef.current?.animationManager?.closeCarLight();}} type='primary'>关车灯</Button> <br />
      <Button onClick={() => {carRef.current?.animationManager?.openDoors();}} type='primary'>开车门</Button> <br />
      <Button onClick={() => {carRef.current?.animationManager?.closeDoors();}} type='primary'>关车门</Button> <br />
      <div className={styles['car-color']}>换色<ColorPicker onChange={(_val, color) => {
        carRef.current?.animationManager?.setCarColor(color);
      }} /></div> <br />
    </div>
    <div className={styles.car} id="carContainer" />

  </div>;
}

export default Demo;