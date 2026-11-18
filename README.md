# SAMVAD — local development

This directory contains three separate Git repositories:

| Part | Technology | Local address |
| --- | --- | --- |
| `SAMVAD-Web` | Next.js / React | http://localhost:3000 |
| `SAMVAD-BACKEND` | Express / MongoDB | http://localhost:5000 |
| Backend `ml/` | Flask / scikit-learn | http://localhost:5001/health |
| `SAMVAD-Mobile` | React Native (native Android/iOS, **not Expo**) | Metro: http://localhost:8081 |

## Start on this computer

Dependencies, local configuration, Python environment and sample data have been installed.
From `/home/lovemishra/Desktop/SAMVAD`:

```bash
npm run dev
```

This starts the local MongoDB container, Express, the ML classifier, Next.js and Metro.
Open http://localhost:3000. Select a booth to see voter analysis and schemes.
Stop the Node/Python services with Ctrl+C. MongoDB remains running to retain your data;
`npm run db:stop` stops it without deleting the persistent Docker volume.

### Android

Start an Android emulator in Android Studio, then use a **second terminal**:

```bash
cd /home/lovemishra/Desktop/SAMVAD
npm run android
```

Installed emulator: `Medium_Phone_API_37.0`. You can also start it with:

```bash
"$ANDROID_HOME/emulator/emulator" -avd Medium_Phone_API_37.0
```

The app's development API URL is configured in `SAMVAD-Mobile/src/api/config.ts`:
Android emulator → `http://10.0.2.2:5000`; iOS simulator → `http://localhost:5000`.
For a USB Android phone, change the development URL to `http://localhost:5000`
and run `adb reverse tcp:5000 tcp:5000` and `adb reverse tcp:8081 tcp:8081`.
Release builds still use the original Render URL; its availability is not guaranteed.

### Demo login

Use **7000000000** (Vijay Patel, seeded student) or another number from
`SAMVAD-BACKEND/data/VotersData.csv`. Request an OTP in the app and read the
six-digit `[DEV OTP]` code in the **backend terminal**. Enter that code within
five minutes. There is no fixed OTP and no WhatsApp/SMS is sent in console mode.
Complete the eligibility form after login.

Mobile recommendations appear after a category notification is created from the
web dashboard; the mobile Schemes page works without sending a notification.
Applications and feedback are stored in the same database and visible on the web.
Campaign SMS/voice delivery is simulated by the original project.

## Reinstall on a new machine

Prerequisites: Node.js **22.11+**, npm, Python **3.11+** with venv support, Docker.
Android additionally needs Java 17, Android SDK platform/build-tools 36, NDK
27.1.12297006, `ANDROID_HOME`, and an emulator or connected device.

```bash
npm run setup
npm run dev
# Second terminal, with an Android emulator running:
npm run android
```

Setup installs each repository from its lockfile, creates `.env` files only if
missing, generates a random JWT secret, installs Python dependencies, checks the
saved model, starts MongoDB, and seeds an **empty** database. Rerunning setup does
not overwrite existing environment files or database records.

The local MongoDB container is `samvad-mongodb`, bound to **127.0.0.1:27017**;
its persistent volume is `samvad-mongodb-data`, and the app database is `samvad_local`.
If you use an existing MongoDB service instead, configure `MONGODB_URL` in the
backend `.env`, run the seed only against your intended empty development database,
and start each component individually rather than `npm run dev`.

## Configuration

- Backend: `SAMVAD-BACKEND/.env` (template: `.env.example`). Do not commit secrets.
- Web: `SAMVAD-Web/.env.local`, `BACKEND_URL=http://127.0.0.1:5000`.
  Restart Next.js after changing the proxy URL; production builds need rebuilding.
- Python: `SAMVAD-BACKEND/.venv`; scripts select Windows/Linux/macOS paths automatically.
  scikit-learn is pinned to **1.8.0**, the version that saved the included model.
- Local messaging: `NODE_ENV=development`, `MESSAGING_MODE=console`.
  For real WhatsApp, explicitly switch to `twilio` and provide `TWILIO_ACCOUNT_SID`,
  `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`. Console mode is refused in production.
- Android release signing: supply `MYAPP_UPLOAD_*` in your private
  `~/.gradle/gradle.properties`. The clone does not include a release keystore.

Individual commands:

```bash
npm run dev:server
npm run dev:web
npm run dev:mobile
```

## Checks

```bash
npm run check          # backend unit tests, mobile TypeScript and Jest
npm run build:web      # Next.js production build
npm run smoke          # running web, API, MongoDB and ML checks
npm run smoke:mobile   # end-to-end mobile APIs against isolated samvad_smoke DB
npm --prefix SAMVAD-Web run lint
npm --prefix SAMVAD-Mobile run lint
```

`smoke:mobile` starts a temporary API on port 5002 and seeds only the separate
`samvad_smoke` database. It tests OTP/JWT, profiles, applications, feedback,
notifications and campaigns without sending messages or changing `samvad_local`.

## Limitations / deployment cautions

- iOS must be built on **macOS with Xcode** and CocoaPods; it cannot run on this Linux computer.
- The web admin APIs are public in the original design. This is a **local/demo setup**,
  not a production security review. Add admin authentication, rate limiting and
  production OTP storage before exposing it publicly.
- Next.js was updated within version 16 for critical security fixes. Remaining
  transitive tooling advisories need separate review; do not use `npm audit fix --force`
  blindly, as it suggests incompatible framework downgrades/upgrades.
- Some existing UI lint/performance warnings remain; they do not block builds.
- Map tiles and Google fonts still require internet. Leaflet's stylesheet is bundled locally.

See each repository's README for the original project description. This root guide
supersedes the older Node 18 instructions and Windows-only ML startup instructions.
