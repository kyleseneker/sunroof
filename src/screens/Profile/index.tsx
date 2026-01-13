/**
 * Profile Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Shield,
  FileText,
  HelpCircle,
  Bell,
  Download,
  Trash2,
  Thermometer,
  MapPin,
  Cloud,
  ScanFace,
} from 'lucide-react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import { Background, Header } from '@/components/ui';
import { useAuth, useToast } from '@/providers';
import {
  hapticClick,
  hapticSuccess,
  hapticError,
  areNotificationsEnabled,
  setNotificationsEnabled,
  scheduleDailyReminder,
  cancelDailyReminder,
  getPreferences,
  setPreference,
  createLogger,
  isBiometricsAvailable,
  getBiometricType,
  getBiometricName,
  type TemperatureUnit,
  type BiometricType,
} from '@/lib';

const log = createLogger('Profile');
import { exportUserData, deleteUserAccount } from '@/services';

import {
  ProfileHero,
  MenuItem,
  MenuSection,
  TemperatureToggle,
  SettingsSwitch,
  SignOutButton,
} from './components';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Preferences state
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('fahrenheit');
  const [captureLocation, setCaptureLocation] = useState(true);
  const [captureWeather, setCaptureWeather] = useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  // Biometrics state
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  useEffect(() => {
    // Check notification permission status
    areNotificationsEnabled()
      .then((enabled) => {
        setNotificationsEnabledState(enabled);
        setNotificationsLoading(false);
      })
      .catch(() => {
        setNotificationsLoading(false);
      });

    // Load preferences
    getPreferences()
      .then((prefs) => {
        setTemperatureUnit(prefs.temperatureUnit);
        setCaptureLocation(prefs.captureLocation);
        setCaptureWeather(prefs.captureWeather);
        setBiometricsEnabled(prefs.biometricsEnabled);
        setPreferencesLoading(false);
      })
      .catch(() => {
        setPreferencesLoading(false);
      });

    // Check biometrics availability
    isBiometricsAvailable().then((available) => {
      setBiometricsAvailable(available);
      if (available) {
        getBiometricType().then(setBiometricType);
      }
    });
  }, []);

  const handleSignOut = useCallback(() => {
    hapticClick();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          hapticClick();
          await signOut();
        },
      },
    ]);
  }, [signOut]);

  const handleToggleTemperatureUnit = useCallback(async () => {
    hapticClick();
    const newUnit: TemperatureUnit = temperatureUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    setTemperatureUnit(newUnit);
    try {
      await setPreference('temperatureUnit', newUnit);
      hapticSuccess();
    } catch {
      hapticError();
      showToast('Failed to save preference', 'error');
      setTemperatureUnit(temperatureUnit); // Revert
    }
  }, [temperatureUnit, showToast]);

  const handleToggleCaptureLocation = useCallback(
    async (value: boolean) => {
      hapticClick();
      setCaptureLocation(value);
      try {
        await setPreference('captureLocation', value);
        // If location is disabled, also disable weather
        if (!value && captureWeather) {
          setCaptureWeather(false);
          await setPreference('captureWeather', false);
        }
      } catch {
        hapticError();
        showToast('Failed to save preference', 'error');
        setCaptureLocation(!value); // Revert
      }
    },
    [captureWeather, showToast]
  );

  const handleToggleCaptureWeather = useCallback(
    async (value: boolean) => {
      hapticClick();
      if (value && !captureLocation) {
        showToast('Location must be enabled for weather', 'error');
        return;
      }
      setCaptureWeather(value);
      try {
        await setPreference('captureWeather', value);
      } catch {
        hapticError();
        showToast('Failed to save preference', 'error');
        setCaptureWeather(!value); // Revert
      }
    },
    [captureLocation, showToast]
  );

  const handleToggleBiometrics = useCallback(
    async (value: boolean) => {
      hapticClick();
      setBiometricsEnabled(value);
      try {
        await setPreference('biometricsEnabled', value);
        hapticSuccess();
        showToast(
          value
            ? `${getBiometricName(biometricType)} enabled`
            : `${getBiometricName(biometricType)} disabled`,
          'success'
        );
      } catch {
        hapticError();
        showToast('Failed to save preference', 'error');
        setBiometricsEnabled(!value); // Revert
      }
    },
    [biometricType, showToast]
  );

  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      hapticClick();
      setNotificationsLoading(true);

      try {
        const success = await setNotificationsEnabled(value);

        if (success) {
          setNotificationsEnabledState(value);

          if (value) {
            // Schedule daily reminder at 7 PM
            await scheduleDailyReminder(19);
            hapticSuccess();
          } else {
            await cancelDailyReminder();
          }
        } else {
          // Permission was denied
          hapticError();
          showToast('Please enable notifications in Settings', 'error');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        log.error(' Notification toggle error', { error: message });
        hapticError();
        showToast('Failed to update notifications', 'error');
      } finally {
        setNotificationsLoading(false);
      }
    },
    [showToast]
  );

  const handleExportData = useCallback(async () => {
    if (!user?.id || exporting) return;

    hapticClick();
    setExporting(true);

    try {
      const { data, error } = await exportUserData(user.id);

      if (error || !data) {
        throw new Error(error || 'Export failed');
      }

      const jsonData = JSON.stringify(data, null, 2);

      await Share.share({
        message: jsonData,
        title: 'Sunroof Data Export',
      });

      hapticSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Export data error', { error: message });
      hapticError();
      showToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  }, [user?.id, exporting, showToast]);

  const confirmDeleteAccount = useCallback(async () => {
    if (!user?.id || deleting) return;

    setDeleting(true);

    try {
      const { error } = await deleteUserAccount(user.id);

      if (error) {
        throw new Error(error);
      }

      hapticSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      log.error(' Delete account error', { error: message });
      hapticError();
      showToast('Failed to delete account', 'error');
      setDeleting(false);
    }
  }, [user?.id, deleting, showToast]);

  const handleDeleteAccount = useCallback(() => {
    hapticClick();
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your journeys and memories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  }, [confirmDeleteAccount]);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <View style={styles.container}>
      <Background unsplashQuery="warm sunset mountain landscape" />
      <Header paddingTop={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <ProfileHero displayName={displayName} email={user?.email} avatarUrl={avatarUrl} />

        <MenuSection>
          <MenuItem
            icon={<Thermometer size={18} color={colors.primary} />}
            label="Temperature Units"
            rightElement={
              <TemperatureToggle
                value={temperatureUnit}
                onChange={handleToggleTemperatureUnit}
                loading={preferencesLoading}
              />
            }
          />
          <MenuItem
            icon={<MapPin size={18} color={colors.primary} />}
            label="Capture Location"
            rightElement={
              <SettingsSwitch
                value={captureLocation}
                onValueChange={handleToggleCaptureLocation}
                loading={preferencesLoading}
              />
            }
          />
          <MenuItem
            icon={
              <Cloud size={18} color={captureLocation ? colors.primary : 'rgba(255,255,255,0.3)'} />
            }
            label="Capture Weather"
            rightElement={
              <SettingsSwitch
                value={captureWeather}
                onValueChange={handleToggleCaptureWeather}
                loading={preferencesLoading}
                disabled={!captureLocation}
              />
            }
          />
          <MenuItem
            icon={<Bell size={18} color={colors.primary} />}
            label="Notifications"
            rightElement={
              <SettingsSwitch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                loading={notificationsLoading}
              />
            }
          />
          {biometricsAvailable && (
            <MenuItem
              icon={<ScanFace size={18} color={colors.primary} />}
              label={getBiometricName(biometricType)}
              rightElement={
                <SettingsSwitch
                  value={biometricsEnabled}
                  onValueChange={handleToggleBiometrics}
                  loading={preferencesLoading}
                />
              }
            />
          )}
        </MenuSection>

        <MenuSection>
          <MenuItem
            icon={<HelpCircle size={18} color={colors.primary} />}
            label="How Sunroof Works"
            onPress={() => {
              hapticClick();
              navigation.navigate('Help' as never);
            }}
          />
          <MenuItem
            icon={<Download size={18} color={colors.primary} />}
            label="Export My Data"
            onPress={handleExportData}
            loading={exporting}
          />
        </MenuSection>

        <MenuSection>
          <MenuItem
            icon={<Shield size={18} color="rgba(255,255,255,0.5)" />}
            label="Privacy Policy"
            onPress={() => {
              hapticClick();
              navigation.navigate('Privacy' as never);
            }}
          />
          <MenuItem
            icon={<FileText size={18} color="rgba(255,255,255,0.5)" />}
            label="Terms of Service"
            onPress={() => {
              hapticClick();
              navigation.navigate('Terms' as never);
            }}
          />
        </MenuSection>

        <MenuSection>
          <MenuItem
            icon={<Trash2 size={18} color={colors.error} />}
            label="Delete Account"
            onPress={handleDeleteAccount}
            loading={deleting}
            danger
          />
        </MenuSection>

        {/* Sign out */}
        <SignOutButton onPress={handleSignOut} />

        {/* Version */}
        <Text style={styles.version}>Sunroof v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  version: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
