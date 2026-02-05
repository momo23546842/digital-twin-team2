# Digital Twin Frontend

A modern, type-safe Next.js 16 frontend application for the Digital Twin platform.

## Project Structure

```
digital-twin-frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Authentication route group
│   │   ├── (dashboard)/    # Dashboard route group
│   │   ├── api/            # API routes
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── layout/         # Layout components
│   │   ├── dashboard/      # Dashboard feature components
│   │   ├── chat/           # Chat feature components
│   │   ├── insights/       # Insights feature components
│   │   ├── settings/       # Settings feature components
│   │   └── shared/         # Shared components
│   ├── lib/                 # Utilities and libraries
│   │   ├── api/            # API client and endpoints
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── store/          # State management (Zustand)
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Application constants
├── public/                  # Static assets
└── config files            # Next.js, Tailwind, TypeScript config
```

## Key Features

- **Next.js 16 App Router**: Modern React 19 with Server Components
- **Type Safety**: Full TypeScript support with strict mode
- **Styling**: Tailwind CSS with custom component library
- **State Management**: Zustand for global state
- **API Layer**: Centralized API client with Axios
- **Custom Hooks**: React hooks for feature-specific logic
- **Component Organization**: Feature-based folder structure

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Check TypeScript types

## Architecture Decisions

### App Router vs Pages Router
Using App Router for better performance, Server Components, and layout organization.

### Component Organization
- **ui/**: Reusable base components
- **layout/**: Shared layout components
- **Feature folders**: Self-contained feature components
- **shared/**: Components used across features

### State Management
- **Zustand**: Lightweight global state management
- **React Query**: Server state management
- **React Hooks**: Local component state

### Type Safety
- Strict TypeScript configuration
- Zod for runtime validation
- Centralized type definitions

## Naming Conventions

- Components: `PascalCase` (e.g., `Button.tsx`)
- Utilities: `camelCase` (e.g., `formatDate.ts`)
- Types: `PascalCase` with `Type` suffix (e.g., `UserType`)
- Hooks: `camelCase` with `use` prefix (e.g., `useChat.ts`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)

## Best Practices

1. **Component Composition**: Build complex UIs from simple, reusable components
2. **Type Safety**: Always define types for props, state, and API responses
3. **Error Handling**: Implement proper error boundaries and error states
4. **Performance**: Use React.memo for expensive components, optimize re-renders
5. **Accessibility**: Follow WCAG guidelines, use semantic HTML
6. **Testing**: Write tests for critical components and utilities

## Environment Variables

See `.env.local.example` for available configuration options.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m 'Add your feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

## License

MIT
