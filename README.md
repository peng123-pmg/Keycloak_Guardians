# Keycloak Guardians Theme

A modern, customizable Keycloak login theme built with React and Keycloakify.

## ✨ Features

- 🎨 Beautiful gradient UI with glassmorphism effects
- 🌐 Multi-language support (Chinese/English)
- 📱 Fully responsive design
- 🔐 Complete Keycloak authentication flow
- ⚡ Built with modern web technologies
- 🎯 Easy to customize and deploy

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Keycloakify** - Keycloak theme framework
- **Vite** - Build tool
- **CSS Modules** - Scoped styling

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Keycloak server (for deployment)

### Install Dependencies

```bash
npm install
```

## 🚀 Development

### Run Development Server

Start the development server with hot reload:

```bash
npm run dev
```

Visit `http://localhost:5173` to preview the theme.

### Build for Production

Build the Keycloak theme JAR file:

```bash
npm run build-keycloak-theme
```

The compiled theme JAR will be generated in the `dist_keycloak/` directory:
- `keycloak-theme-for-kc-22-to-25.jar` - For Keycloak 22-25
- `keycloak-theme-for-kc-all-other-versions.jar` - For other versions

## 📁 Project Structure

```
Keycloak_Guardians-main/
├── src/
│   ├── login/                    # Login theme
│   │   ├── pages/               # Page components
│   │   │   ├── Login.tsx        # Login page
│   │   │   ├── Register.tsx     # Registration page
│   │   │   └── ...
│   │   ├── components/          # Reusable components
│   │   │   ├── Header.tsx       # Theme header
│   │   │   └── Footer.tsx       # Theme footer
│   │   ├── KcApp.tsx           # Main app component
│   │   └── i18n.tsx            # Internationalization
│   ├── pages/                   # Dashboard pages (demo)
│   │   └── Dashboard/
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── dist_keycloak/              # Build output (JAR files)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── README.md                   # This file
```

## 🎨 Customization

### Colors

Edit the CSS variables in your component modules to customize colors:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Languages

Add or modify translations in `src/login/i18n.tsx`:

```typescript
export const i18n = {
  zh: {
    loginTitle: "登录",
    // ... more translations
  },
  en: {
    loginTitle: "Login",
    // ... more translations
  }
};
```

## 🚢 Deployment

1. Build the theme:
   ```bash
   npm run build-keycloak-theme
   ```

2. Copy the JAR file from `dist_keycloak/` to your Keycloak `providers` directory:
   ```bash
   cp dist_keycloak/keycloak-theme-for-kc-22-to-25.jar /opt/keycloak/providers/
   ```

3. Rebuild Keycloak (if using Docker):
   ```bash
   docker exec -it keycloak /opt/keycloak/bin/kc.sh build
   ```

4. Restart Keycloak server

5. Select the theme in Keycloak Admin Console:
   - Navigate to your realm → Themes
   - Set "Login Theme" to "lixinran-keycloak-theme"

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build-keycloak-theme` - Build Keycloak theme JAR
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👤 Author

李欣冉 (Li Xinran)

## 🙏 Acknowledgments

- [Keycloakify](https://www.keycloakify.dev/) - For the amazing Keycloak theme framework
- [Keycloak](https://www.keycloak.org/) - For the robust identity and access management solution
