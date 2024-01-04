import styles from './style.module.less';

export default function MenuContainer(props: any): JSX.Element {
  return <div className={styles['menu-container']}>
    {props.children}
  </div>;
}