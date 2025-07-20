import Head from 'next/head';
import AccountabilityApp from '@/components/AccountabilityApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>Accountability On Autopilot - Your AI-Powered Discipline Coach</title>
        <meta name="description" content="Transform your goals into habits with AI-powered coaching, daily accountability, and smart insights. Start your journey today." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Accountability On Autopilot" />
        <meta property="og:description" content="Your AI-powered discipline coach for building lasting habits" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <AccountabilityApp />
    </>
  );
}
