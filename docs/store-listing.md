# App Store and Google Play listing

Copy for both stores, ready to paste. Character limits are noted where the stores enforce them.

## Names

| Field | Text | Limit |
|---|---|---|
| App name | Always Fresh | 30 |
| Subtitle (iOS) | Book top barbers, home or shop | 30 |
| Short description (Android) | Book Dubai's best barbers at the shop, at home or in your hotel. Pay in the app. | 80 |
| Promotional text (iOS, can change without review) | New: book your usual in one tap, join a shop's walk-in queue from your phone, and message your barber. | 170 |

## Description

> Fresh cuts, on your schedule.
>
> Always Fresh is the easiest way to book a great barber in Dubai and beyond, at the barbershop, at your home, your hotel suite or even your yacht.
>
> **Find your barber**
> • Browse verified barbers with real reviews, photos of their work, before-and-afters and reels
> • Search by style (skin fade, beard sculpt, kids cut), by price, by who's free today, or by who's nearest
> • See barbershops, book any free chair, or hire the whole shop for a party
>
> **Book in seconds**
> • Pick a service, add extras like a hot towel or head massage, and choose a time
> • Pay with Apple Pay, Google Pay or card. Tip your barber in the app: 100% goes to them
> • Off-peak deals on quiet hours
> • Get reminders the day before and an hour before, and an alert when your barber is on the way
>
> **Made for regulars**
> • Book your usual in one tap, and get a nudge when it's time for your next cut
> • Your cut card keeps your barber's notes and photos of every cut
> • Message your barber, share your visit with a friend, and change the time if plans move
> • The Club: monthly cuts at member prices. Gift cards for friends
>
> **Try before you cut**
> • AI Try-On shows new styles on your own photo
> • The Always Fresh Concierge answers questions 24/7
>
> **For barbers and barbershops**
> Barbers get a business dashboard: their calendar, earnings, clients, booking rules and a personal booking link with QR code. Barbershops get a shop panel with every chair's calendar, walk-ins, a virtual queue, check-in tablet, staff roles and payroll.

## Keywords (iOS, 100 characters, comma-separated, no spaces)

`barber,haircut,fade,beard,barbershop,grooming,men,salon,dubai,booking,home,hotel,shave,appointment`

## Categories

- iOS: Lifestyle (primary), Health & Fitness (secondary)
- Google Play: Beauty

## Age rating

- iOS: 4+ (no objectionable content; user-generated reels are moderated and can be reported)
- Google Play: Everyone (IARC questionnaire: user interaction yes, shares location yes, digital purchases yes)

## Privacy

Privacy policy URL: `https://alwaysfresh.app/legal/privacy` (the in-app page at Settings → Privacy policy, published on the website).

### Apple privacy "nutrition label" (Data linked to the user)

| Data | Used for | Tracking |
|---|---|---|
| Name, email, phone number | App functionality, customer support | No |
| Precise location (only when the user taps "Nearest" or "Use my location" for a home visit; never in the background) | App functionality | No |
| Photos (profile, review, try-on, barber portfolio) | App functionality | No |
| Government ID and barber licence photos (only barbers who apply to join) | App functionality (identity checks) | No |
| Purchase history | App functionality | No |
| User ID, device ID (push token) | App functionality | No |
| Customer support messages, in-app messages | App functionality, customer support | No |

No data is used for tracking or sold. Payment card details are handled by Stripe and never reach Always Fresh.

### Permissions: when each is asked, and why

Nothing is asked at launch. Each permission is asked the first time someone uses the feature, after a short screen that explains it (the system prompt can only be shown once). If it was turned off, the app offers the phone's Settings instead, and Settings → Permissions in the app shows each one.

| Permission | Asked when | Why | Alternative if declined |
|---|---|---|---|
| Location, while using the app (iOS "When In Use", Android approximate or precise) | "Nearest" in search, or "Use my location" when a barber comes to you | Nearest barbers; distance and extra travel for a home visit | The city centre, or pick an area |
| Notifications | After the first booking, from Alerts, or Settings | Confirmations, reminders, "on the way", messages | The in-app Alerts inbox |
| Camera | Tapping "Camera" / "Retake" (try-on selfie, ID and licence photos, profile and work photos) | Taking that photo | Choose a photo or file instead |
| Calendar (iOS 17+: add-only) | Tapping "Add to calendar" | Adding that appointment with alerts | Nothing is added |
| Photos | Never: the system picker shows only the photos the person picks | — | — |

Not used, and removed from the builds: microphone, background location, motion, Face ID, full photo-library access (Android `READ_MEDIA_*`), draw-over-other-apps, tracking (no ATT prompt; `NSPrivacyTracking` is false). Google Play needs no background-location or photo-and-video permission declaration.

### Google Play Data safety

Same data as above. Data is encrypted in transit. Users can request deletion in the app (Settings → Delete account) and get a copy of their data (Settings → Email me a copy).

## Screenshots (6.9" iPhone and Android phone, 1320 × 2868)

1. Home: "Precision cuts. Timeless style." with the hero photo
2. Barber profile with reviews, level and the deal line
3. Booking: services and extras, times with "−15%" off-peak
4. Slide to book with Apple Pay
5. Reels grid
6. My cuts with the barber's notes and photos
7. Shop page with "Join the queue"
8. Barber dashboard (for the barber audience)

## App Review notes (iOS)

> Sign-in for review: create an account in the app, or use the sample customer `omar@example.com` / `customer-demo` on the review build. Payments run in Stripe test mode on the review build: use card 4242 4242 4242 4242, any future date, any CVC.
> Barber side: `mateo@demo.alwaysfresh.app` / `fresh-barber-demo`. Barbershop panel: `owner@demo.alwaysfresh.app` / `fresh-shop-demo`.
> Account deletion: Settings → Delete account.
> Permissions are asked only when a feature is used, each after a short explanation: location for "Nearest" or "Use my location" on a home visit, the camera when tapping Camera, notifications after the first booking or from Alerts, the calendar when tapping Add to calendar. Settings → Permissions lists them. No background location, microphone or tracking.

## Before submitting

- [ ] Replace the placeholders in `app/eas.json` (App Store Connect app id, Apple team id) and add the Google Play service-account key file (kept out of git)
- [ ] `npx eas-cli build --profile production --platform all`, then `npx eas-cli submit --profile production`
- [ ] Set `EXPO_PUBLIC_API_URL` in each build profile to the real API address
- [ ] Have the lawyer approve the terms and privacy policy and set `LEGAL_REVIEWED = true` in `app/src/lib/legal.ts`
