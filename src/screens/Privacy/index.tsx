/**
 * Privacy Policy Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  ShieldCheck,
  Eye,
  Database,
  Lock,
  UserCheck,
  Mail,
  Cpu,
  MapPin,
  Users,
  Share2,
  Globe,
  Clock,
  Bell,
} from 'lucide-react-native';
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
          <Section icon={<Eye size={18} color={colors.primary} />} title="Overview">
            <Text style={styles.text}>
              Kyle Seneker (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Sunroof
              mobile application (&quot;Service&quot;). This Privacy Policy describes how we
              collect, use, disclose, and safeguard your personal information when you use our
              Service. By accessing or using the Service, you consent to the collection and use of
              your information in accordance with this Privacy Policy. If you do not agree with our
              policies and practices, do not use the Service.
            </Text>
          </Section>

          <Section icon={<Users size={18} color={colors.primary} />} title="Children's Privacy">
            <Text style={styles.text}>
              Sunroof is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13. If you are a parent or guardian
              and believe your child has provided us with personal information, please contact us at{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('mailto:privacy@getsunroof.com')}
              >
                privacy@getsunroof.com
              </Text>{' '}
              and we will promptly delete such information.
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

          <Section icon={<MapPin size={18} color={colors.primary} />} title="Location & Weather">
            <Text style={styles.text}>
              With your permission, we capture location and weather data with each memory to enrich
              your journey experience. This data is:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Only collected when you actively capture a memory" />
              <SimpleBullet text="Stored with your memory and locked until the unlock date" />
              <SimpleBullet text="Never shared with third parties for advertising" />
              <SimpleBullet text="Controllable via your device settings and in-app preferences" />
            </View>
          </Section>

          <Section icon={<Cpu size={18} color={colors.primary} />} title="AI Features">
            <Text style={styles.text}>
              Our AI Recap feature generates journey summaries. Here&apos;s how we protect your
              privacy:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Only text notes are sent to AI—never photos, videos, or audio" />
              <SimpleBullet text="AI processing is done via OpenAI's API" />
              <SimpleBullet text="Recaps are saved to your account and can be deleted anytime" />
              <SimpleBullet text="You choose when to generate a recap—it's never automatic" />
            </View>
          </Section>

          <Section icon={<Bell size={18} color={colors.primary} />} title="Push Notifications">
            <Text style={styles.text}>
              With your permission, we send push notifications to remind you when journeys unlock
              and for daily capture reminders. We collect your device token to deliver these
              notifications. You can disable notifications at any time in your device settings or
              within the app.
            </Text>
          </Section>

          <Section icon={<Share2 size={18} color={colors.primary} />} title="Third-Party Services">
            <Text style={styles.text}>
              We share data with the following third-party services to operate Sunroof:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Supabase (database, authentication, file storage) — stores your account and memory data" />
              <SimpleBullet text="OpenAI (AI recaps) — receives only text notes, never photos or audio" />
              <SimpleBullet text="OpenWeather (weather data) — receives your location coordinates" />
              <SimpleBullet text="Unsplash (cover images) — receives search queries for destinations" />
            </View>
            <Text style={styles.text}>
              We do not sell your personal information. We do not share your data with advertisers
              or data brokers.
            </Text>
          </Section>

          <Section icon={<Lock size={18} color={colors.primary} />} title="Data Storage & Security">
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
            icon={<Globe size={18} color={colors.primary} />}
            title="International Data Transfers"
          >
            <Text style={styles.text}>
              Your data may be transferred to and processed in countries other than your own,
              including the United States where our servers and third-party service providers are
              located. By using Sunroof, you consent to the transfer of your information to these
              countries, which may have different data protection laws than your jurisdiction.
            </Text>
          </Section>

          <Section icon={<Clock size={18} color={colors.primary} />} title="Data Retention">
            <Text style={styles.text}>
              We retain your data for as long as your account is active. When you delete your
              account, all your data including journeys, memories, and personal information is
              permanently deleted within 30 days. Backup copies may persist for up to 90 days before
              complete removal.
            </Text>
          </Section>

          <Section icon={<UserCheck size={18} color={colors.primary} />} title="Your Rights">
            <SimpleBullet text="Access all your personal data through the app" />
            <SimpleBullet text="Delete your account and all associated data" />
            <SimpleBullet text="Export your unlocked memories" />
            <SimpleBullet text="Control location and weather capture in settings" />
            <SimpleBullet text="Opt out of AI features entirely" />
          </Section>

          <Section
            icon={<ShieldCheck size={18} color={colors.primary} />}
            title="California Privacy Rights"
          >
            <Text style={styles.text}>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA):
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Right to know what personal information we collect and how it is used" />
              <SimpleBullet text="Right to delete your personal information" />
              <SimpleBullet text="Right to opt-out of the sale of personal information (we do not sell your data)" />
              <SimpleBullet text="Right to non-discrimination for exercising your privacy rights" />
            </View>
            <Text style={styles.text}>
              To exercise these rights, contact us at{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('mailto:privacy@getsunroof.com')}
              >
                privacy@getsunroof.com
              </Text>
              . We will respond to verifiable consumer requests within 45 days.
            </Text>
          </Section>

          <Section icon={<Clock size={18} color={colors.primary} />} title="Changes to This Policy">
            <Text style={styles.text}>
              We may update this Privacy Policy from time to time. If we make material changes, we
              will notify you by posting the updated policy within the Service and updating the
              &quot;Last updated&quot; date above. We encourage you to review this Privacy Policy
              periodically for any changes. Your continued use of the Service after the posting of
              changes constitutes your acceptance of such changes.
            </Text>
          </Section>

          <Section icon={<Mail size={18} color={colors.primary} />} title="Contact Us" isLast>
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
