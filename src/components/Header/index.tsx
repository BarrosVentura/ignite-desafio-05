import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${commonStyles.container} ${styles.container}`}>
      <Link href="/">
        <a href="/">
          <Image width={239} height={27} src="/images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
