export default function Footer() {
  return (
    <footer className="w-full border-t mt-8">
      <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Digital Twin — Built for demos
      </div>
    </footer>
  );
}
