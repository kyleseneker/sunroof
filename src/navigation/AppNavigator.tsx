/**
 * App Navigator - Main navigation setup
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/providers';
import {
  LoginScreen,
  HomeScreen,
  JourneyScreen,
  CameraScreen,
  GalleryScreen,
  ViewerScreen,
  VaultScreen,
  ProfileScreen,
  PrivacyScreen,
  TermsScreen,
  HelpScreen,
  AIRecapScreen,
  MemoriesScreen,
} from '@/screens';
import type { RootStackParamList } from '@/types';
import { colors } from '@/constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, loading } = useAuth();

  // Keep showing native splash while auth loading
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.gradientEnd },
          animation: 'slide_from_right',
        }}
      >
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen name="Main" component={HomeScreen} />
            <Stack.Screen
              name="Journey"
              component={JourneyScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                animation: 'slide_from_right',
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="Gallery"
              component={GalleryScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Viewer"
              component={ViewerScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Vault"
              component={VaultScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Privacy"
              component={PrivacyScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="AIRecap"
              component={AIRecapScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Memories"
              component={MemoriesScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          // Auth stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Privacy"
              component={PrivacyScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
