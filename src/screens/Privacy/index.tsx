/**
 * Privacy Policy Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ShieldCheck, Eye, Database, Lock, UserCheck, Mail, Cpu, MapPin } from 'lucide-react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '@/constants/theme';
import { Background, Header, Hero } from '@/components/ui';

export function PrivacyScreen() {
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
          icon={<ShieldCheck size={32} color={colors.white} />}
          title="Privacy Policy"
          subtitle="Last updated: January 10, 2026"
        />

        <View style={styles.sections}>
          <Section
            icon={<Eye size={18} color={colors.primary} />}
            title="Overview"
          >
            <Text style={styles.text}>
              Sunroof is committed to protecting your privacy. This Privacy Policy explains how 
              we collect, use, and safeguard your information when you use our mobile application.
            </Text>
          </Section>

          <Section
            icon={<Database size={18} color={colors.primary} />}
            title="Information We Collect"
          >
            <BulletPoint
              label="Photos & Videos"
              text="Media you capture is stored securely until your chosen unlock date."
            />
            <BulletPoint
              label="Audio Memos"
              text="Voice recordings you create (up to 5 minutes each)."
            />
            <BulletPoint
              label="Text Notes"
              text="Written notes and reflections you add to your journeys."
            />
            <BulletPoint
              label="Journey Data"
              text="Journey names, destinations, emojis, unlock dates, and cover images."
            />
            <BulletPoint
              label="Account Info"
              text="Email address and profile data from Google OAuth or email sign-in."
            />
          </Section>

          <Section
            icon={<MapPin size={18} color={colors.primary} />}
            title="Location & Weather"
          >
            <Text style={styles.text}>
              With your permission, we capture location and weather data with each memory to 
              enrich your journey experience. This data is:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Only collected when you actively capture a memory" />
              <SimpleBullet text="Stored with your memory and locked until the unlock date" />
              <SimpleBullet text="Never shared with third parties for advertising" />
              <SimpleBullet text="Controllable via your device settings and in-app preferences" />
            </View>
          </Section>

          <Section
            icon={<Cpu size={18} color={colors.primary} />}
            title="AI Features"
          >
            <Text style={styles.text}>
              Our AI Recap feature generates journey summaries. Here's how we protect your privacy:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Only text notes are sent to AI—never photos, videos, or audio" />
              <SimpleBullet text="AI processing is done via OpenAI's API" />
              <SimpleBullet text="Recaps are saved to your account and can be deleted anytime" />
              <SimpleBullet text="You choose when to generate a recap—it's never automatic" />
            </View>
          </Section>

          <Section
            icon={<Lock size={18} color={colors.primary} />}
            title="Data Storage & Security"
          >
            <Text style={styles.text}>
              Your memories are stored securely using industry-standard practices:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Backend powered by Supabase with SOC 2 Type II compliance" />
              <SimpleBullet text="Authentication tokens stored in secure device keychain" />
              <SimpleBullet text="Media files stored in encrypted cloud storage" />
              <SimpleBullet text="Offline captures are stored locally until synced" />
            </View>
          </Section>

          <Section
            icon={<UserCheck size={18} color={colors.primary} />}
            title="Your Rights"
          >
            <SimpleBullet text="Access all your personal data through the app" />
            <SimpleBullet text="Delete your account and all associated data" />
            <SimpleBullet text="Export your unlocked memories" />
            <SimpleBullet text="Control location and weather capture in settings" />
            <SimpleBullet text="Opt out of AI features entirely" />
          </Section>

          <Section
            icon={<Mail size={18} color={colors.primary} />}
            title="Contact Us"
            isLast
          >
            <Text style={styles.text}>
              If you have questions about this Privacy Policy or want to exercise your data rights, 
              please contact us at{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('mailto:privacy@getsunroof.com')}
              >
                privacy@getsunroof.com
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

function BulletPoint({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>
        <Text style={styles.bulletLabel}>{label}: </Text>
        {text}
      </Text>
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
  bulletLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: fontWeight.medium,
  },
  link: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
