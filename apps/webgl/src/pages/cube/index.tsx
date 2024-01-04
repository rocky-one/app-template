import { useEffect } from 'react';
import styles from './style.module.less';
import { createWebGLContext } from '@/components/webgl/common/core';
import { createCube } from '@/components/webgl/cube';

function Cube(): JSX.Element {

  useEffect(() => {
    const gl = createWebGLContext(document.getElementById('webglCanvas') as HTMLCanvasElement);
    createCube(gl);
  }, []);

  return <div className={styles['cube-container']}>
    <canvas className={styles.canvas} height="800" id='webglCanvas' width="800" />
  </div>;
}

export default Cube;