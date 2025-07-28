import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/auth-context-real';
import { ToasterProvider } from '@/components/ui/toaster';
import { ThemeProvider } from '@/lib/theme-context';
// import { Inter } from 'next/font/google';

// const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <ThemeProvider>
        <AuthProvider>
          <ToasterProvider>
            <Component {...pageProps} />
          </ToasterProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
