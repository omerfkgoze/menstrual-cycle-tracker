import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Ana navigasyon yığını için parametre listesi
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

// Alt sekme navigasyonu için parametre listesi
export type MainTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Log: undefined;
  Stats: undefined;
  Profile: undefined;
};

// Navigasyon prop tipleri
export type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login' | 'Register' | 'ForgotPassword'>;
export type MainScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home' | 'Calendar' | 'Log' | 'Stats' | 'Profile'>;