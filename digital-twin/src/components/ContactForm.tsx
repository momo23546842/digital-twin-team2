'use client';

import React, { useState } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface ContactFormProps {
  conversationId?: string;
  onSuccess?: () => void;
}

export default function ContactForm({ conversationId, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    company: '',
    title: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'chat',
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact information');
      }

      setSuccess(true);
      setFormData({
        email: '',
        name: '',
        phone: '',
        company: '',
        title: '',
        message: '',
      });

      if (onSuccess) {
        onSuccess();
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2 items-start">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex gap-2 items-start">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-400">
            Thank you! I'll be in touch soon.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="CTO"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Message
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 px-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          placeholder="Tell me more about what you're interested in..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Contact Info'
        )}
      </button>
    </form>
  );
}
