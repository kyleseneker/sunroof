/**
 * AI Recap Screen - Display AI-generated journey recap
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Sparkles, Camera, Mic, FileText } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Background, Header, Button } from '@/components/ui';
import type { RootStackParamList } from '@/types';

type AIRecapRouteProp = RouteProp<RootStackParamList, 'AIRecap'>;

export function AIRecapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AIRecapRouteProp>();
  const { journeyName, recap, highlights, photoCount, audioCount, noteCount, coverImageUrl } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Background
        imageUrl={coverImageUrl}
        unsplashQuery="warm sunset mountain landscape"
        blurRadius={20}
      />
      <Header paddingTop={insets.top} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.heroIconGradient}
            >
              <Sparkles size={32} color={colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>{journeyName}</Text>
          <Text style={styles.heroSubtitle}>AI-Generated Recap</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {photoCount > 0 && (
            <View style={styles.statPill}>
              <Camera size={14} color={colors.primary} />
              <Text style={styles.statValue}>{photoCount}</Text>
            </View>
          )}
          {audioCount > 0 && (
            <View style={styles.statPill}>
              <Mic size={14} color={colors.primary} />
              <Text style={styles.statValue}>{audioCount}</Text>
            </View>
          )}
          {noteCount > 0 && (
            <View style={styles.statPill}>
              <FileText size={14} color={colors.primary} />
              <Text style={styles.statValue}>{noteCount}</Text>
            </View>
          )}
        </View>

        {/* Recap text */}
        <View style={styles.recapCard}>
          <Text style={styles.recapText}>{recap}</Text>
        </View>

        {/* Highlights */}
        {highlights.length > 0 && (
          <View style={styles.highlightsSection}>
            <View style={styles.sectionHeader}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Highlights</Text>
            </View>
            {highlights.map((highlight, i) => (
              <View key={i} style={styles.highlightCard}>
                <View style={styles.highlightIcon}>
                  <Text style={styles.highlightStar}>✦</Text>
                </View>
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Back to memories button */}
        <Button
          title="View Memories"
          onPress={handleBack}
          variant="accent"
          size="lg"
          fullWidth
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientEnd,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroIconContainer: {
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.6)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.overlay.light,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  recapCard: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  recapText: {
    fontSize: fontSize.lg,
    lineHeight: 30,
    color: colors.white,
    fontWeight: fontWeight.light,
  },
  highlightsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
    marginBottom: spacing.sm,
  },
  highlightIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(249,115,22,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightStar: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  highlightText: {
    flex: 1,
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.md,
  },
});

