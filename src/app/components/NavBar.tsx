import Link from 'next/link';

export const NavBar = () => (
  <nav className="navbar shadow-md">
    <Link href="/">
      <h1 className="btn btn-ghost">もぺブログ</h1>
    </Link>
  </nav>
);
