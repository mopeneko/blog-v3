import Link from 'next/link';

export const Footer = ({ className }: { className?: string }) => (
  <div className={`w-full text-center ${className}`}>
    <Link className="link" href="/pages/disclaimer">
      免責事項
    </Link>{' '}
    <Link className="link" href="/pages/privacy-policy">
      プライバシーポリシー
    </Link>
  </div>
);
