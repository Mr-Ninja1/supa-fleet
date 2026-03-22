/* global workbox */

// Basic Workbox-powered service worker for Supa-Fleet PWA.
// Caches static assets so the app loads quickly on mobile.

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js')

if (self.workbox) {
  workbox.core.skipWaiting()
  workbox.core.clientsClaim()

  // Runtime caching for JS, CSS, and image assets
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'supa-fleet-static',
    }),
  )

  // Cache the root document for quicker reloads
  workbox.routing.registerRoute(
    ({ request, url }) => request.mode === 'navigate' && url.pathname === '/',
    new workbox.strategies.NetworkFirst({
      cacheName: 'supa-fleet-pages',
    }),
  )
} else {
  // eslint-disable-next-line no-console
  console.log('Workbox could not be loaded. No offline support.')
}
