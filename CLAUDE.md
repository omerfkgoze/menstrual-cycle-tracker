# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

Start development server:
```bash
npm start
# or
expo start
```

Platform-specific builds:
```bash
npm run android  # Android simulator
npm run ios      # iOS simulator
npm run web      # Web browser
```

## Project Architecture

This is a React Native menstrual cycle tracking app built with Expo and Supabase.

### Technology Stack
- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Context API
- **Navigation**: React Navigation with bottom tabs
- **UI**: React Native Paper, Styled Components
- **Charts**: React Native Chart Kit
- **Calendar**: React Native Calendars

### Database Schema
Core tables with RLS policies:
- `profiles` - User profile data (extends auth.users)
- `cycles` - Menstrual cycle records
- `symptoms` - Symptom tracking
- `moods` - Mood tracking  
- `medications` - Medication tracking
- `notes` - General notes

Sexual intercourse tracking is planned but not yet implemented.

### File Structure
```
/screens/
  auth/           - Login, Register, ForgotPassword
  main/           - Home, Calendar, Log, Stats, Profile
/context/         - AuthContext, ThemeContext
/lib/supabase.ts  - Database client and helper functions
/types/models.ts  - TypeScript interfaces
/components/      - Reusable UI components
```

### Key Implementation Details

**Authentication**: Uses Supabase Auth with automatic profile creation via triggers.

**Database Access**: The `lib/supabase.ts` file contains helper functions organized by table (db.profiles, db.cycles, etc.) with error handling and fallback logic.

**State Management**: React Context handles auth state and theme preferences.

**Navigation**: Bottom tab navigation with auth flow protection.

### Environment Setup
Requires `.env` file with:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Data Privacy
- Row Level Security enforces user data isolation
- All sensitive health data uses proper authorization checks
- Profile creation includes fallback mechanisms for resilience