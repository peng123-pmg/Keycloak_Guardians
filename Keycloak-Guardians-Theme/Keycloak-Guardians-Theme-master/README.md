# Keycloak Guardians Theme

A custom Keycloak login theme built with React and Keycloakify.

## Features

- 🎨 Modern gradient UI design
- 🌐 Multi-language support (Chinese/English)
- 📱 Responsive layout
- 🔐 Complete Keycloak authentication flow

## Tech Stack

- React 18
- TypeScript
- Keycloakify
- Vite

## Quick Start

### Install Dependencies
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build Theme
```bash
npm run build-keycloak-theme
```

The compiled theme JAR will be in `dist_keycloak/` directory.

## Project Structure

```
src/
├── login/           # Login theme components
│   ├── pages/       # Page templates
│   ├── KcApp.tsx    # Main app component
│   └── i18n.tsx     # Internationalization
└── main.tsx         # Entry point
```

## License

MIT
