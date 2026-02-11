'use client';

import React from 'react';
import { ArrowRight, MessageCircle, Mic, FileText, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <p className="text-emerald-400 text-sm font-medium">🚀 Your AI Career Assistant</p>
          </div>


          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Meet Your Digital Twin
          </h2>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Chat with an AI assistant that knows everything about me. Ask questions, explore my experience, and
            let's talk about opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </a>
          </div>

          {/* Visual Demo */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur">
            <div className="bg-slate-900 rounded-lg p-6 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MessageCircle size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 bg-slate-800 rounded p-3 text-left text-slate-300">
                  Hi! What can you tell me about your experience?
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-emerald-500/20 rounded p-3 text-right text-slate-300">
                  I have 10+ years building AI systems and leading teams...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-white text-center mb-16">Powerful Features</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: 'Natural Chat',
                description: 'Chat naturally with an AI trained on my background and expertise',
              },
              {
                icon: <Mic className="w-8 h-8" />,
                title: 'Voice Support',
                description: 'Talk to me using voice - perfect for quick conversations',
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Rich Context',
                description: 'Ask about my projects, skills, and experience in detail',
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Schedule Meetings',
                description: 'Book time directly for interviews or collaborations',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure & Private',
                description: 'Your conversations are secure and never shared',
              },
              {
                icon: <ArrowRight className="w-8 h-8" />,
                title: 'Always Available',
                description: '24/7 availability to answer your questions',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-xl p-6 hover:bg-slate-700/50 transition-colors">
                <div className="text-emerald-400 mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-white mb-8">About Me</h3>
          <div className="bg-slate-700/30 border border-slate-600 rounded-2xl p-8">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              I'm a passionate full-stack engineer and product leader with expertise in AI, cloud technologies, and
              building scalable systems. With a background in both startup and enterprise environments, I bring a
              diverse perspective to technical challenges.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              This Digital Twin is your window into my experience. Feel free to ask me anything - from technical
              depth to strategic thinking. I'm always excited to connect with interesting people and opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">Ready to Connect?</h3>
          <p className="text-xl text-slate-300 mb-8">
            Start a conversation and let's explore what we can build together.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Digital Twin</h4>
              <p className="text-slate-400 text-sm">Your AI career assistant</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Product</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><Link href="/chat" className="hover:text-emerald-400 transition-colors">Chat</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Legal</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Social</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Digital Twin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
