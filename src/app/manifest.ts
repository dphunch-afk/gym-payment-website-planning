import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Gym Owner Manager',
    short_name: 'Gym Manager',
    description: 'Gym fees, dues, expenses, attendance, workouts and member self-service',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f4f6f8',
    theme_color: '#111827',
    categories: ['business', 'fitness', 'productivity'],
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' }
    ],
    shortcuts: [
      { name: 'Owner dashboard', short_name: 'Owner', url: '/owner' },
      { name: 'Member portal', short_name: 'Member', url: '/member' }
    ]
  };
}
