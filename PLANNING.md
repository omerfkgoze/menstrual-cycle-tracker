# Menstrual Cycle Tracking App - Planning Document

## Project Overview

This application allows users to track their menstrual cycles, record sexual intercourse, log symptoms, and securely manage their health data. The app aims to provide a user-friendly and informative experience that prioritizes user privacy.

## Technology Stack

### Frontend

- **Framework**: React Native
- **Development Platform**: Expo
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: React Native Paper, Styled Components
- **Charts**: React Native Chart Kit
- **Calendar**: React Native Calendars

### Backend

- **Platform**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

## Architecture

The application is designed according to the following architectural principles:

### Layered Architecture

1. **Presentation Layer**: React Native components and screens
2. **Business Logic Layer**: Context API and helper functions
3. **Data Access Layer**: Supabase client and API calls
4. **Data Storage Layer**: Supabase PostgreSQL database

### File Structure

```
/
├── assets/               # Visual and static files
├── components/           # Reusable UI components
├── context/              # React Context API files
├── lib/                  # Helper libraries and API clients
├── screens/              # Application screens
│   ├── auth/             # Authentication screens
│   └── main/             # Main application screens
├── supabase/             # Supabase configuration and migration files
├── types/                # TypeScript type definitions
├── utils/                # Helper functions and tools
├── App.tsx               # Main application component
└── package.json          # Dependencies and scripts
```

## Database Schema

### Tables

#### 1. profiles

- `id` (UUID, PK): User ID (reference from auth.users table)
- `updated_at` (timestamp): Last update time
- `username` (text): Username
- `full_name` (text): Full name
- `avatar_url` (text): Profile picture URL
- `birth_date` (date): Birth date
- `cycle_average_length` (integer): Average cycle length (days)
- `period_average_length` (integer): Average period length (days)
- `last_period_start_date` (date): Last period start date
- `email_notifications` (boolean): Email notifications preference
- `push_notifications` (boolean): Push notifications preference
- `theme_preference` (text): Theme preference (light/dark/system)

#### 2. cycles

- `id` (serial, PK): Cycle ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `start_date` (date): Cycle start date
- `end_date` (date): Cycle end date
- `cycle_length` (integer): Cycle length (days)
- `period_length` (integer): Period length (days)
- `notes` (text): Notes

#### 3. Sexual Intercourse

- `id` (serial, PK): Sexual Intercourse ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `date` (date): Sexual Intercourse date
- `type` (text): Sexual Intercourse type
- `intensity` (text): Sexual Intercourse intensity (light/medium/severe)
- `notes` (text): Notes

#### 4. symptoms

- `id` (serial, PK): Symptom ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `date` (date): Symptom date
- `type` (text): Symptom type
- `intensity` (text): Symptom intensity (light/medium/severe)
- `notes` (text): Notes

#### 5. moods

- `id` (serial, PK): Mood ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `date` (date): Mood date
- `type` (text): Mood type
- `intensity` (text): Mood intensity (slight/moderate/strong)
- `notes` (text): Notes

#### 6. medications

- `id` (serial, PK): Medication ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `name` (text): Medication name
- `dosage` (text): Dosage
- `date` (date): Medication date
- `time` (time): Medication time
- `taken` (boolean): Whether taken
- `recurring` (boolean): Whether recurring medication
- `recurring_days` (text[]): Recurring days
- `notes` (text): Notes

#### 7. notes

- `id` (serial, PK): Note ID
- `created_at` (timestamp): Creation time
- `user_id` (UUID, FK): User ID
- `date` (date): Note date
- `content` (text): Note content

## Security and Privacy

### Row Level Security (RLS)

RLS policies are applied to all tables, ensuring that users can only access their own data.

### Data Encryption

Encryption is applied for sensitive data. User data is securely stored both on the server side and client side.

### Data Minimization

The application only collects and processes necessary data. Users can delete or export their data at any time.

## Screens and Flows

### Authentication Flow

1. Login Screen
2. Registration Screen
3. Password Reset Screen

### Main Application Flow

1. Home Page (Cycle status and summary)
2. Calendar (Cycle and symptom viewing)
3. Data Entry (Cycle, Sexual Intercourse, symptom, mood, and medication logging)
4. Statistics (Cycle analysis and graphs)
5. Profile (User settings and account management)

## Design Principles

### UI/UX

- Clean and minimal design
- Easy usability
- Compliance with accessibility standards
- Responsive and adaptive interface
- Dark/light theme support

### Color Palette

- **Primary Color**: #FF6B81 (Pink)
- **Secondary Color**: #FFA5B3 (Light Pink)
- **Success**: #4CD964 (Green)
- **Warning**: #FFCC00 (Yellow)
- **Error**: #FF3B30 (Red)
- **Info**: #5AC8FA (Blue)

## Future Features

- Machine learning algorithms for cycle predictions
- Health recommendations and insights
- Social sharing features (optional)
- Connection with health professionals
- Multi-language support
- Web application integration
- Apple Health and Google Fit integration

## Development Timeline

1. **Phase 1: Basic Application (2 weeks)**

   - Project setup
   - Authentication
   - Basic screens
   - Database schema

2. **Phase 2: Core Features (3 weeks)**

   - Cycle tracking
   - Symptom and mood logging
   - Calendar view
   - Profile management

3. **Phase 3: Advanced Features (4 weeks)**

   - Statistics and graphs
   - Predictions and analysis
   - Reminders and notifications
   - Data export

4. **Phase 4: Testing and Optimization (2 weeks)**

   - User testing
   - Performance optimization
   - Bug fixing
   - Final improvements

5. **Phase 5: Launch and Monitoring (1 week)**
   - Upload to App Store and Google Play
   - User feedback
   - Analytics tracking
   - Improvements and updates

## Coding Standards

- TypeScript type safety
- Functional components and React Hooks
- Code formatting with ESLint and Prettier
- Unit tests with Jest
- Detailed code comments
- Clear variable and function names
- Modular and reusable code
- Performance optimization

## Scalability and Performance

- Efficient state management
- Lazy loading and code splitting
- Caching strategies
- Offline-first approach
- Database indexing and optimization
- CDN usage for static assets

## Conclusion

This planning document provides a framework for guiding the development process of the Menstrual Cycle Tracker Application. As the project progresses, it will be updated based on user feedback and new requirements.
