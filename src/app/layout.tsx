
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'AI-Powered Campus Resource Management Using Next.js with a Genkit Recommendation Engine',
  description: 'Streamline your campus resource management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-body: 'Poppins', sans-serif;
            --font-headline: 'Poppins', sans-serif;
          }
        `}</style>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
