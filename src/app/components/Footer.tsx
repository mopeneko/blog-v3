import Link from 'next/link';

export const Footer = () => (
  <div className="my-4 w-full text-center">
    <Link className="link" href="/pages/disclaimer">
      免責事項
    </Link>{' '}
    <Link className="link" href="/pages/privacy-policy">
      プライバシーポリシー
    </Link>
  </div>
);
