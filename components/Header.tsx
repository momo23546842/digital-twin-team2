import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b bg-white/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">Digital Twin</Link>
        <nav className="space-x-4 text-sm text-slate-600">
          <Link href="/chat">Chat</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
