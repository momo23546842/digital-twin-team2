'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// PhoneDialer は client component なので dynamic が安全
const PhoneDialer = dynamic(() => import('@/components/PhoneDialer'), { ssr: false });

export default function CallWidgetGate() {
  const pathname = usePathname();

  // ✅ ここで「どこで電話UIを出すか」決める
  // 例：トップ "/" のみ表示、/chat では非表示
  const shouldShow = pathname === '/';

  if (!shouldShow) return null;
  return <PhoneDialer />;
}
