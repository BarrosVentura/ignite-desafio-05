import Image from 'next/image';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.container}`}>
      <Image width={239} height={27} src="/images/Logo.svg" alt="ig.news" />
    </header>
  );
}
