import type { Metadata } from 'next';
import './globals.css';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';

export const metadata: Metadata = {
  title: 'Gym Owner Manager',
  description: 'Gym fees, dues, expenses, attendance and member self-service'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
