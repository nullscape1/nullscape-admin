import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }, []);
  return null;
}


