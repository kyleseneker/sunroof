/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FileText, Shield, Users, AlertTriangle, Scale, RefreshCw, Mail } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Background, Header, Hero } from '@/components/ui';

export function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Background unsplashQuery="warm sunset mountain landscape" />
      <Header paddingTop={insets.top} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Hero
          icon={<FileText size={32} color={colors.white} />}
          title="Terms of Service"
          subtitle="Last updated: January 10, 2026"
        />

        <View style={styles.sections}>
          <Section
            icon={<Shield size={18} color={colors.primary} />}
            title="Acceptance of Terms"
          >
            <Text style={styles.text}>
              By accessing or using Sunroof, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the app.
            </Text>
          </Section>

          <Section
            icon={<FileText size={18} color={colors.primary} />}
            title="Description of Service"
          >
            <Text style={styles.text}>
              Sunroof is a time capsule app for capturing memories during journeys. You can capture 
              photos, videos, audio memos, and text notes—all of which remain locked until your 
              chosen unlock date. Features include:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Photo and video capture with location and weather context" />
              <SimpleBullet text="Audio recordings up to 5 minutes" />
              <SimpleBullet text="Text notes with your thoughts and reflections" />
              <SimpleBullet text="Collaborative journeys shared with others" />
              <SimpleBullet text="AI-powered journey recaps (using only text notes, never photos or audio)" />
              <SimpleBullet text="Offline capture with automatic background sync" />
            </View>
          </Section>

          <Section
            icon={<Users size={18} color={colors.primary} />}
            title="User Content"
          >
            <SimpleBullet text="You retain all rights to the photos, videos, audio, and notes you create" />
            <SimpleBullet text="You are responsible for all content you capture and upload" />
            <SimpleBullet text="Do not upload content that violates any laws or third-party rights" />
            <SimpleBullet text="Content shared in collaborative journeys is visible to all collaborators after unlock" />
          </Section>

          <Section
            icon={<AlertTriangle size={18} color={colors.primary} />}
            title="Acceptable Use"
          >
            <Text style={styles.text}>You agree not to:</Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Use the service for any illegal purpose" />
              <SimpleBullet text="Upload harmful, offensive, or inappropriate content" />
              <SimpleBullet text="Attempt to access other users' locked memories" />
              <SimpleBullet text="Circumvent the time-lock mechanism" />
              <SimpleBullet text="Interfere with the proper functioning of the service" />
            </View>
          </Section>

          <Section
            icon={<Scale size={18} color={colors.primary} />}
            title="Disclaimer & Liability"
          >
            <Text style={styles.text}>
              The service is provided "as is" without warranties of any kind. While we strive to 
              keep your memories safe, we do not guarantee that the service will be uninterrupted, 
              secure, or error-free. We recommend keeping copies of important memories. To the 
              maximum extent permitted by law, we shall not be liable for any loss of data or 
              indirect damages.
            </Text>
          </Section>

          <Section
            icon={<RefreshCw size={18} color={colors.primary} />}
            title="Changes to Terms"
          >
            <Text style={styles.text}>
              We reserve the right to modify these terms at any time. We will notify you of 
              significant changes through the app. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </Text>
          </Section>

          <Section
            icon={<Mail size={18} color={colors.primary} />}
            title="Contact"
            isLast
          >
            <Text style={styles.text}>
              For questions about these Terms, contact us at{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('mailto:hello@getsunroof.com')}
              >
                hello@getsunroof.com
              </Text>
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

function SimpleBullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gradientEnd,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
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
  bulletList: {
    marginTop: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  bulletText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    flex: 1,
  },
  link: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
