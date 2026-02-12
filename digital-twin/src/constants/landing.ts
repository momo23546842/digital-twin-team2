/**
 * Landing Page Constants
 * Contains all hardcoded values, configuration, and data structures
 */

export const LANDING_FEATURES = [
  {
    icon: '💬',
    title: 'Smart Chat',
    description: 'AI-powered conversations that understand context and provide intelligent responses instantly.',
  },
  {
    icon: '🎤',
    title: 'Voice Call',
    description: 'Natural voice conversations with your digital twin. Start, stop, and interact naturally.',
  },
  {
    icon: '📅',
    title: 'Book Meetings',
    description: 'Let visitors schedule meetings directly. Manage your calendar seamlessly.',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Track conversations, leads, and insights. See how visitors interact with your twin.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'End-to-end encryption and secure data storage. Your privacy matters.',
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Optimized for speed. Responses in milliseconds for seamless conversations.',
  },
] as const;

export const LANDING_BENEFITS = [
  {
    title: 'Real-time Conversations',
    description: 'Streaming AI responses for natural, flowing conversations',
  },
  {
    title: 'Voice & Chat',
    description: 'Choose between typing or speaking. Your preference.',
  },
  {
    title: 'Lead Capture',
    description: 'Automatically capture contact info from conversations',
  },
  {
    title: 'Admin Dashboard',
    description: 'View all conversations and manage leads in one place',
  },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Twitter', href: '#' },
  { label: 'LinkedIn', href: '#' },
  { label: 'GitHub', href: '#' },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: 'Features', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Security', href: '#' },
  ],
  company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
} as const;

export const SOCIAL_PROOF = {
  count: '500+',
  label: 'conversations started',
} as const;
