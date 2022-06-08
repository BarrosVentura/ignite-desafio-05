import Image from 'next/image';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={commonStyles.container}>
      <Image width={240} height={25} src="/images/Logo.svg" alt="ig.news" />
    </header>
  );
}
