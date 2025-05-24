import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';

// Function to get the localized tab label
const getTabLabel = (routeName: string, defaultLabel: any): React.ReactNode => {
  switch (routeName) {
    case 'Home': return 'Ana Sayfa';
    case 'Calendar': return 'Takvim';
    case 'Log': return 'Kayıt';
    case 'Stats': return 'İstatistik';
    case 'Profile': return 'Profil';
    default: return typeof defaultLabel === 'string' ? defaultLabel : routeName;
  }
};

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
        
        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Calendar':
            iconName = 'calendar';
            break;
          case 'Log':
            iconName = 'plus-circle';
            break;
          case 'Stats':
            iconName = 'chart-bar';
            break;
          case 'Profile':
            iconName = 'account';
            break;
          default:
            iconName = 'circle';
        }
        
        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <View style={styles.tabContent}>
              {/* IconButton yerine Text component içinde icon kullanıyoruz */}
              <Text style={[styles.icon, { color: isFocused ? theme.primary : theme.text }]}>
                {iconName === 'home' ? '🏠' :
                 iconName === 'calendar' ? '📅' :
                 iconName === 'plus-circle' ? '➕' :
                 iconName === 'chart-bar' ? '📊' :
                 iconName === 'account' ? '👤' : '⚪'}
              </Text>
              <Text style={[
                styles.label,
                { color: isFocused ? theme.primary : theme.text }
              ]}>
                {getTabLabel(route.name, label)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: -5,
  },
});

export default TabBar;