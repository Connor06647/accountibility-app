import '@/styles/globals.css';
import type { AppProps } from 'next/app';
// import { AuthProvider } from '@/lib/auth-context';
// import { Toaster } from '@/components/ui/toaster';
// import { Inter } from 'next/font/google';

// const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      {/* <AuthProvider> */}
        <Component {...pageProps} />
        {/* <Toaster /> */}
      {/* </AuthProvider> */}
    </div>
  );
}
