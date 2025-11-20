import type { AppProps } from 'next/app';
import '../styles.css';
import { AuthProvider } from '../context/AuthContext';
import { useRouter } from 'next/router';
import WithAuth from '../components/WithAuth';
import Toasts from '../components/Toasts';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuthFree = router.pathname === '/login';
  return (
    <AuthProvider>
      {isAuthFree ? (
        <Component {...pageProps} />
      ) : (
        <WithAuth>
          <Component {...pageProps} />
        </WithAuth>
      )}
      <Toasts />
    </AuthProvider>
  );
}


