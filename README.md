# Shifts App - Professional Shift Management System

A modern, responsive web application for managing work shifts with automatic assignment capabilities. Built with React, TypeScript, and Material-UI.

## 🚀 Features

- **Worker Management**: Workers can set their availability for upcoming weeks
- **Automatic Assignment**: Smart algorithm assigns workers to stations based on availability and requirements
- **Manager Dashboard**: Managers can review, edit, and approve shift assignments
- **Mobile Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant feedback and notifications
- **Gender-based Requirements**: Support for gender-specific station assignments
- **Professional UI**: Modern, clean interface with Material-UI components

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Routing**: React Router v6
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast
- **Build Tool**: Vite

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## 👥 Demo Accounts

The app includes demo accounts for testing:

### Workers
- **John Worker** (john@example.com) - Male worker
- **Sarah Worker** (sarah@example.com) - Female worker

### Managers
- **Mike Manager** (mike@example.com) - Manager account

**Password for all accounts**: `password`

## 🎯 How It Works

### For Workers:
1. **Login** with your credentials
2. **Set Availability** for the next week by checking/unchecking days
3. **View Shifts** to see your assigned shifts
4. **Dashboard** shows your shift statistics and quick actions

### For Managers:
1. **Login** with manager credentials
2. **Generate Assignments** automatically based on worker availability
3. **Review & Edit** shift assignments as needed
4. **Approve Shifts** to finalize the schedule

### Automatic Assignment Algorithm:
- Considers worker availability for each day
- Respects gender requirements for specific stations
- Balances workload across available workers
- Prioritizes stations based on importance

## 📱 Mobile Support

The app is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🎨 Customization

### Themes
The app uses Material-UI theming. You can customize colors, fonts, and other design elements in `src/main.tsx`.

### Stations
Add or modify stations in the `ManagerDashboard.tsx` file:
```typescript
const demoStations = [
  { 
    id: '1', 
    name: 'Assembly Line A', 
    genderRequirement: 'any', 
    maxWorkers: 2, 
    priority: 1 
  },
  // Add more stations...
]
```

### Workers
Add or modify workers in the `Login.tsx` file:
```typescript
const demoUsers = [
  {
    id: '1',
    name: 'John Worker',
    email: 'john@example.com',
    role: 'worker',
    gender: 'male',
    department: 'Production',
  },
  // Add more workers...
]
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

### Option 2: Netlify
1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

### Option 3: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase: `firebase init`
3. Build the project: `npm run build`
4. Deploy: `firebase deploy`

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── stores/             # State management (Zustand)
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── ...
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation above
2. Review the code comments
3. Create an issue on GitHub

## 🎉 What's Next?

Potential enhancements for future versions:
- Real-time notifications
- Email/SMS alerts
- Advanced scheduling algorithms
- Integration with HR systems
- Mobile app versions
- Advanced reporting and analytics
- Multi-location support

---

**Built with ❤️ using modern web technologies** 