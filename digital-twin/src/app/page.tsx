import ChatPane from "@/components/ChatPane";
import CallHistory from "../../app/components/CallHistory";
import { Phone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Chat Interface */}
      <ChatPane />

      {/* Call History Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-900">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Phone className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Phone Call History</h2>
          </div>
          <p className="text-slate-400 text-sm">
            View recordings and transcripts of recent calls handled by your AI assistant
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl">
          <CallHistory />
        </div>
      </section>
    </div>
  );
}
