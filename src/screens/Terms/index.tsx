/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
  UserX,
  Globe,
  Sparkles,
  Gavel,
} from 'lucide-react-native';
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
          <Section icon={<Shield size={18} color={colors.primary} />} title="Acceptance of Terms">
            <Text style={styles.text}>
              By downloading, accessing, or using the Sunroof mobile application
              (&quot;Service&quot;), you (&quot;User&quot; or &quot;you&quot;) agree to be legally
              bound by these Terms of Service (&quot;Terms&quot;) and our Privacy Policy, which is
              incorporated herein by reference. These Terms constitute a binding legal agreement
              between you and Kyle Seneker (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). If
              you do not agree to these Terms, you must not access or use the Service.
            </Text>
          </Section>

          <Section icon={<Users size={18} color={colors.primary} />} title="Eligibility">
            <Text style={styles.text}>
              Sunroof is not directed to children under 13 years of age. By accessing or using this
              Service, you represent and warrant that you are at least 13 years old. If we learn
              that we have collected personal information from a child under 13, we will take steps
              to delete that information as soon as possible.
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

          <Section icon={<Users size={18} color={colors.primary} />} title="User Content">
            <Text style={styles.text}>
              You retain all ownership rights to the photos, videos, audio recordings, and text
              notes (&quot;User Content&quot;) that you create using the Service. By uploading User
              Content, you grant us a limited, non-exclusive, royalty-free license to store,
              process, and display your User Content solely for the purpose of providing the Service
              to you.
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="You are solely responsible for all User Content you capture and upload" />
              <SimpleBullet text="You represent and warrant that your User Content does not violate any applicable laws or infringe upon the rights of any third party" />
              <SimpleBullet text="User Content shared in collaborative journeys will be visible to all designated collaborators after the unlock date" />
              <SimpleBullet text="We do not claim ownership of your User Content and will not use it for any purpose other than providing the Service" />
            </View>
          </Section>

          <Section icon={<AlertTriangle size={18} color={colors.primary} />} title="Acceptable Use">
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
            icon={<Sparkles size={18} color={colors.primary} />}
            title="Third-Party Services"
          >
            <Text style={styles.text}>
              Sunroof integrates with third-party services to provide its features:
            </Text>
            <View style={styles.bulletList}>
              <SimpleBullet text="Supabase for authentication, database, and file storage" />
              <SimpleBullet text="Sentry for error tracking and performance monitoring" />
              <SimpleBullet text="OpenAI for AI-powered journey recaps (text notes only)" />
              <SimpleBullet text="OpenWeather for weather data" />
              <SimpleBullet text="Unsplash for journey cover images" />
            </View>
            <Text style={styles.text}>
              We are not responsible for the availability, accuracy, or practices of these
              third-party services. Your use of these features is subject to the respective
              third-party terms.
            </Text>
          </Section>

          <Section
            icon={<Scale size={18} color={colors.primary} />}
            title="Disclaimer of Warranties"
          >
            <Text style={[styles.text, { marginBottom: 12 }]}>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS
              WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
              TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT.
            </Text>
            <Text style={[styles.text, { marginBottom: 8 }]}>
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or
              that any defects will be corrected.
            </Text>
            <Text style={styles.text}>
              You acknowledge that you use the Service at your own risk. We strongly recommend
              maintaining independent copies of any content that is important to you.
            </Text>
          </Section>

          <Section
            icon={<Scale size={18} color={colors.primary} />}
            title="Limitation of Liability"
          >
            <Text style={[styles.text, { marginBottom: 12 }]}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL KYLE SENEKER OR
              SUNROOF BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF
              GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, WHETHER BASED
              ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED
              OF THE POSSIBILITY OF SUCH DAMAGES.
            </Text>
            <Text style={styles.text}>
              Our total liability for any claims arising from these Terms or your use of the Service
              shall not exceed the amount you paid us, if any, in the twelve (12) months preceding
              the claim.
            </Text>
          </Section>

          <Section icon={<UserX size={18} color={colors.primary} />} title="Account Termination">
            <Text style={styles.text}>
              We reserve the right to suspend or terminate your account if you violate these Terms
              or engage in conduct that we determine, in our sole discretion, to be harmful to other
              users, us, or third parties. You may delete your account at any time through the app
              settings. Upon deletion, all your data including journeys and memories will be
              permanently removed.
            </Text>
          </Section>

          <Section icon={<Gavel size={18} color={colors.primary} />} title="Indemnification">
            <Text style={styles.text}>
              You agree to indemnify, defend, and hold harmless Kyle Seneker, and his affiliates,
              officers, agents, and employees, from and against any and all claims, liabilities,
              damages, losses, costs, and expenses (including reasonable attorneys&apos; fees)
              arising out of or in any way connected with: (a) your access to or use of the Service;
              (b) your User Content; (c) your violation of these Terms; or (d) your violation of any
              rights of any third party.
            </Text>
          </Section>

          <Section icon={<Globe size={18} color={colors.primary} />} title="Governing Law">
            <Text style={styles.text}>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of California, United States, without regard to its conflict of law provisions.
              Any disputes arising from these Terms or your use of Sunroof shall be resolved in the
              courts located in California.
            </Text>
          </Section>

          <Section
            icon={<RefreshCw size={18} color={colors.primary} />}
            title="Modifications to Terms"
          >
            <Text style={styles.text}>
              We reserve the right to modify these Terms at any time in our sole discretion. If we
              make material changes, we will notify you by posting the updated Terms within the
              Service and updating the &quot;Last updated&quot; date above. Your continued use of
              the Service following the posting of revised Terms constitutes your acceptance of such
              changes. If you do not agree to the modified Terms, you must discontinue your use of
              the Service.
            </Text>
          </Section>

          <Section icon={<FileText size={18} color={colors.primary} />} title="Severability">
            <Text style={styles.text}>
              If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
              court of competent jurisdiction, such invalidity shall not affect the validity of the
              remaining provisions, which shall remain in full force and effect.
            </Text>
          </Section>

          <Section icon={<FileText size={18} color={colors.primary} />} title="Entire Agreement">
            <Text style={styles.text}>
              These Terms, together with our Privacy Policy, constitute the entire agreement between
              you and Kyle Seneker regarding your use of the Service and supersede all prior
              agreements, understandings, and communications, whether written or oral.
            </Text>
          </Section>

          <Section icon={<Mail size={18} color={colors.primary} />} title="Contact" isLast>
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
