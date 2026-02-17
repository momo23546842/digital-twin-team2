import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-white">
      <div className="w-full max-w-2xl text-center px-4 sm:px-6 py-16">
        <div className="mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-2xl sm:text-3xl font-bold">✦</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-extrabold mb-2 sm:mb-3">Digital Twin</h1>
          <p className="text-sm sm:text-lg text-gray-300 max-w-xl mx-auto">
            Chat and call with your AI-powered digital twin
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-center px-6 py-3 bg-[#25D366] text-[#061b13] font-semibold rounded-full shadow-md hover:brightness-95"
          >
            Sign Up
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto text-center px-6 py-3 border border-white/20 text-white rounded-full hover:bg-white/5"
          >
            Log In
          </Link>
        </div>

        <div className="mt-12 text-gray-400">
          <p className="max-w-2xl mx-auto">Secure conversations, simple setup — start a chat or place a call with your AI twin.</p>
        </div>
      </div>
    </main>
  )
}
