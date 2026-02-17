import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">
      <div className="max-w-xl text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Digital Twin</h1>
        <p className="text-lg text-gray-300 mb-8">
          AI-powered assistant that chats and makes phone calls on your behalf.
        </p>
        <Link
          href="/chat"
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#4361ee] hover:bg-[#3550d6] rounded-full font-semibold shadow-lg"
        >
          Open Chat
        </Link>
      </div>
    </main>
  )
}
