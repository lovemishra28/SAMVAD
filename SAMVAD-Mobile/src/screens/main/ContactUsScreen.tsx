import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import { ArrowLeft, Mail, Phone, Globe, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';

const ContactUsScreen = () => {
  const navigation = useNavigation<any>();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error opening link:', err));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Contact Us
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.screenCard}>
          <View style={styles.heroTopInfo}>
            <Text style={styles.heroTitle}>Get in Touch</Text>
            <Text style={styles.heroSubtitle}>
              We are here to help. Reach out to us through any of the channels below.
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* EMAIL CARD */}
            <TouchableOpacity 
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={() => openLink('mailto:support@samvad-demo.gov.in')}
            >
              <View style={styles.iconCircle}>
                <Mail size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>support@samvad-demo.gov.in</Text>
              </View>
              <ExternalLink size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* PHONE CARD */}
            <TouchableOpacity 
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={() => openLink('tel:+9118001234567')}
            >
              <View style={styles.iconCircle}>
                <Phone size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Toll-Free Helpline</Text>
                <Text style={styles.contactValue}>1800 123 4567</Text>
                <Text style={styles.contactSubValue}>Available Mon-Sat, 9AM to 6PM</Text>
              </View>
              <ExternalLink size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* WEBSITE CARD */}
            <TouchableOpacity 
              style={styles.contactCard}
              activeOpacity={0.8}
              onPress={() => openLink('https://www.samvad-demo.gov.in')}
            >
              <View style={styles.iconCircle}>
                <Globe size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Official Website</Text>
                <Text style={styles.contactValue}>www.samvad-demo.gov.in</Text>
              </View>
              <ExternalLink size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            {/* OFFICE ADDRESS */}
            <View style={styles.addressCard}>
              <Text style={styles.addressTitle}>Office Address</Text>
              <Text style={styles.addressText}>
                Ministry of Skill Development & Entrepreneurship,{'\n'}
                Shram Shakti Bhawan, Rafi Marg,{'\n'}
                New Delhi, 110001
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  bodyContainer: {
    flex: 1,
  },

  screenCard: {
    flex: 1,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.xl,
    borderRadius: 28,
    backgroundColor: theme.colors.white,
    ...theme.shadows.card,
    overflow: 'hidden',
  },

  /* HEADER */
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  spacer: { width: 40 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
  },

  /* HERO TOP INFO */
  heroTopInfo: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
  },
  heroTitle: {
    ...theme.typography.subHeader,
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  heroSubtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 6,
    marginBottom: theme.spacing.s,
  },

  /* SCROLL CONTENT */
  scrollContent: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 40,
  },

  /* CONTACT CARDS */
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  contactInfo: {
    flex: 1,
    paddingRight: theme.spacing.m,
  },
  contactLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  contactSubValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  /* ADDRESS CARD */
  addressCard: {
    backgroundColor: '#F4F7FF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.l,
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.m,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22,
  },
});

export default ContactUsScreen;
