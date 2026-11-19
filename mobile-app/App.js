import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuthToken, apiFetch } from './src/config/api';
import { colors } from './src/theme/colors';

import AuthScreen from './src/screens/AuthScreen';
import OnboardingQuizScreen from './src/screens/OnboardingQuizScreen';
import HomeScreen from './src/screens/HomeScreen';
import RoadmapViewScreen from './src/screens/RoadmapViewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [initialRoute, setInitialRoute] = useState('Auth');

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const userData = await apiFetch('/api/auth/me');
        if (userData && userData.user) {
          setUser(userData.user);
          if (userData.user.onboardingCompleted) {
            setInitialRoute('Home');
          } else {
            setInitialRoute('Onboarding');
          }
        }
      }
    } catch (error) {
      console.log('Session restore info:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgPaper} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgPaper },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Auth">
          {(props) => (
            <AuthScreen
              {...props}
              user={user}
              setUser={setUser}
              onAuthSuccess={(token, userData) => {
                setUser(userData);
                if (userData && userData.onboardingCompleted) {
                  props.navigation.replace('Home');
                } else {
                  props.navigation.replace('Onboarding');
                }
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingQuizScreen
              {...props}
              user={user}
              setUser={setUser}
              onOnboardingComplete={(updatedUser) => {
                setUser(updatedUser);
                props.navigation.replace('Home');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} user={user} setUser={setUser} />}
        </Stack.Screen>

        <Stack.Screen name="RoadmapView" component={RoadmapViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
