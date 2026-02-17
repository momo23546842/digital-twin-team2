declare module 'next/navigation' {
  // Minimal declarations to satisfy TypeScript in the workspace editor.
  // We keep `any` to avoid tying to a specific Next.js version.
  export function useRouter(): any;
  export function usePathname(): string | null;
  export function useSearchParams(): any;
}
