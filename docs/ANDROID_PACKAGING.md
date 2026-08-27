# Android packaging strategy

The web/PWA version is the production source of truth. Android packaging starts only after the HTTPS public URL and installable PWA have been verified.

## Recommended first Android package: Trusted Web Activity (TWA)

Use a TWA wrapper for the first Play Store build because the product is already a mobile-first web app and does not currently require native-only APIs.

Requirements before generating APK/AAB:
- Stable HTTPS production domain
- Valid PWA manifest and service worker
- 192px and 512px install icons
- Android application ID chosen
- Release signing key created and stored securely outside the repository
- `assetlinks.json` hosted on the production domain with the release certificate fingerprint

The resulting Android shell should open the production app directly in standalone mode. It must not contain Expo, a development launcher, or a second application UI.

## When to use Capacitor instead

Move to Capacitor only if later versions require native APIs such as push notifications, Bluetooth devices, camera-based QR attendance, background services, or deeper file/device integration. The existing Next.js/PWA remains the primary application and business-logic surface.

## Release sequence

1. Deploy and verify the PWA over HTTPS.
2. Test Owner/Admin and Member workflows on Android Chrome.
3. Confirm Add to Home Screen / install behavior and offline fallback.
4. Generate the TWA Android project from the verified production URL.
5. Configure Digital Asset Links.
6. Build signed APK for device testing.
7. Build signed AAB for Play Console release.
8. Repeat financial, authentication, receipt and privacy tests in the packaged app.

Never commit signing keys, keystore passwords, database passwords, or production secrets to GitHub.
