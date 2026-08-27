import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gym Owner Manager',
    short_name: 'Gym Manager',
    description: 'Gym fees, dues, expenses, attendance and member self-service',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f8',
    theme_color: '#111827',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
    ]
  };
}
