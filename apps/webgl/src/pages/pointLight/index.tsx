import { useEffect, useRef } from 'react';
import styles from './style.module.less';
import { createWebGLContext } from '@/components/webgl/common/core';
import { createCube } from '@/components/webgl/pointLight';

function Cube(): JSX.Element {
  const glRef = useRef<any>();

  useEffect(() => {
    if (!glRef.current) {
      const gl = createWebGLContext(document.getElementById('webglCanvas') as HTMLCanvasElement);
      glRef.current = gl;
      createCube(gl);
    }
    
  }, []);

  return <div className={styles['cube-container']}>
    <canvas className={styles.canvas} height="800" id='webglCanvas' width="800" />
  </div>;
}

export default Cube;