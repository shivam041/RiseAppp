# RiseApp - 66-Day Habit Tracker

A modern habit tracking application built with React, TypeScript, and Tailwind CSS.

## Features

- 🌙 **Dark Mode Toggle** - Switch between light and dark themes
- 📅 **Weekday Scheduling** - Set habits for specific days of the week
- 📊 **Streak Calendar** - Visual calendar with clickable dates
- 📝 **Weekly Schedule View** - See all tasks for the selected week
- 📋 **Notes Page** - Add and manage notes for habits
- 📈 **Stats Page** - View habit statistics and progress
- 🎯 **66-Day Challenge** - Track habits for the full 66-day cycle

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shivam041/RiseAppp.git
   cd RiseAppp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Project Structure

```
src/
├── components/          # React components
│   ├── HabitsBoard.tsx  # Main habit management
│   ├── SimpleTracker.tsx # Day counter and check-in
│   ├── StreakCalendar.tsx # Visual calendar
│   ├── WeekSchedule.tsx  # Weekly task view
│   ├── NotesPage.tsx    # Notes management
│   └── StatsPage.tsx    # Statistics view
├── contexts/            # React contexts
├── services/           # API services
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## Usage

1. **Create Habits**: Add new habits with names, actions, and reminder times
2. **Set Schedule**: Choose which days of the week each habit should run
3. **Track Progress**: Click dates on the calendar to see weekly schedules
4. **Check In**: Mark habits as completed for the day
5. **View Stats**: Monitor your progress and streaks

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with dark mode support
- **React Router** - Client-side routing
- **Local Storage** - Data persistence

## Deployment

The app is configured for deployment on:
- **Netlify** (see `netlify.toml`)
- **Vercel**
- **GitHub Pages**

Simply run `npm run build` and deploy the `build` folder.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
