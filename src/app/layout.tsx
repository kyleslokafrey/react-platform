import './globals.css';

export const metadata = {
  title: 'Next + Neon + shadcn',
  description: 'Minimal starter'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
