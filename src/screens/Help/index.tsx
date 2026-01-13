/**
 * Help Screen - How Sunroof Works
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Compass, Camera, Lock, ImageIcon, HelpCircle } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Background, Header, Hero } from '@/components/ui';

export function HelpScreen() {
  const insets = useSafeAreaInsets();

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
        <Hero
          icon={<HelpCircle size={32} color={colors.white} />}
          title="How Sunroof Works"
          subtitle="Capture now, relive later"
        />

        <View style={styles.sections}>
          <Section icon={<Compass size={18} color={colors.primary} />} title="1. Start a Journey">
            <Text style={styles.text}>
              Create a new journey before you go. Choose when your memories unlock — a week, a
              month, or longer.
            </Text>
          </Section>

          <Section icon={<Camera size={18} color={colors.primary} />} title="2. Capture Moments">
            <Text style={styles.text}>
              Take photos, record voice memos, and write notes during your adventure. They go
              straight to the Vault — no peeking!
            </Text>
          </Section>

          <Section icon={<Lock size={18} color={colors.primary} />} title="3. Stay Present">
            <Text style={styles.text}>
              Your memories stay hidden until the timer expires. Focus on the moment, not your
              camera roll.
            </Text>
          </Section>

          <Section
            icon={<ImageIcon size={18} color={colors.primary} />}
            title="4. Relive the Magic"
            isLast
          >
            <Text style={styles.text}>
              When time&apos;s up, open your Vault and rediscover your journey with fresh eyes.
              It&apos;s like developing film!
            </Text>
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}

function Section({ icon, title, children, isLast }: SectionProps) {
  return (
    <View style={[styles.section, isLast && styles.sectionLast]}>
      <View style={styles.sectionHeader}>
        <LinearGradient
          colors={['rgba(249,115,22,0.2)', 'rgba(234,88,12,0.2)']}
          style={styles.iconContainer}
        >
          {icon}
        </LinearGradient>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>{children}</View>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  sections: {
    backgroundColor: colors.overlay.dark,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sectionLast: {
    borderBottomWidth: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    flex: 1,
  },
  sectionContent: {
    paddingLeft: 48,
  },
  text: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
});
