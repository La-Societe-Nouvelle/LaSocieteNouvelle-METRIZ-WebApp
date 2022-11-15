import { Analytics } from '@vercel/analytics/react';

import '../styles/globals.scss'
import 'bootstrap-icons/font/bootstrap-icons.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

export default MyApp
