# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based movie club dashboard built with Vite that displays and analyzes movie data. The application allows filtering movies by season and presenter, searching by title, and visualizing statistics through charts.

## Architecture

- **Frontend Framework**: React 18 with Vite as the build tool
- **Charts**: Recharts library for data visualization (bar charts)
- **Data Source**: Static JSON file (`src/data/movies.json`) containing movie club data
- **Structure**: Single-page application with one main component (`MovieClubDashboard`)

### Key Components

- `MovieClubDashboard.jsx`: Main component handling all filtering, data processing, and visualization
- `movies.json`: Contains structured movie data with fields like Season, Title, Presenter, Director, etc.
- `main.jsx`: React application entry point

### Data Structure

Movies contain these key fields:
- Season (number)
- Title, Director, Cast
- Presented by (presenter name)
- Duration (min), Genre, Release Year
- Budget, Box Office Gross, Awards
- Synopsis, Themes/Tags, Interesting facts

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install
```

## Key Implementation Details

- Uses React hooks (useState) for state management
- Filters are applied in real-time across season, presenter, and title search
- Charts display movies per season and total watch time per season
- No backend - all data is client-side from JSON file
- Responsive charts using ResponsiveContainer from Recharts