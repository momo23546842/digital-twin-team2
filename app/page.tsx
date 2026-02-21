import { Hero } from 'components';

export default function Page() {
  return (
    <>
      <Hero />
      <section className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-600">
        <p>
          This is the default UI scaffold. Replace components in `components/` to
          customize the homepage.
        </p>
      </section>
    </>
  );
}
