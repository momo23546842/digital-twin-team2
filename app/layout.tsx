import './globals.css';
import { Header, Footer } from 'components';

export const metadata = {
  title: 'Digital Twin',
  description: 'Demo digital twin chatbot',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
