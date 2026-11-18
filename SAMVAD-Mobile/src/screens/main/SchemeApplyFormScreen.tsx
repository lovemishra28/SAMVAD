import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { authApi, getCachedUser, mobileApi } from '../../api/client';

type SchemeData = {
  title: string;
  schemeId?: string;
  benefit_type?: string;
};

const SchemeApplyFormScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scheme: SchemeData = route.params?.scheme ?? { title: 'Scheme' };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [applicantName, setApplicantName] = useState('');
  const [applicantMobileNumber, setApplicantMobileNumber] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const schemeWebsiteLink = scheme?.schemeId
    ? `https://example.gov.in/scheme/${scheme.schemeId}`
    : 'https://example.gov.in/scheme';
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const me = await authApi.getMe().catch(() => null);
        const user = me?.user || (await getCachedUser());

        if (user) {
          const address = [user.city, user.area_type]
            .filter(Boolean)
            .join(', ');
          setApplicantName(user.name || '');
          setApplicantMobileNumber(user.mobileNumber || '');
          setApplicantAddress(address || '');
        }
      } catch {
        // Keep default empty values; user can still edit.
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleSubmit = async () => {
    if (!applicantName.trim() || !applicantMobileNumber.trim()) {
      Alert.alert(
        'Missing Details',
        'Please verify your name and mobile number before applying.',
      );
      return;
    }

    if (aadhaarNumber && !/^[0-9]{12}$/.test(aadhaarNumber.trim())) {
      Alert.alert(
        'Invalid Aadhaar',
        'Please enter a 12-digit Aadhaar number or leave it blank.',
      );
      return;
    }

    setSubmitting(true);
    try {
      await mobileApi.applyForScheme({
        schemeId: scheme.schemeId || scheme.title || 'unknown',
        schemeName: scheme.title,
        applicantName: applicantName.trim(),
        applicantMobileNumber: applicantMobileNumber.trim(),
        applicantAddress: applicantAddress.trim(),
        schemeWebsiteLink: schemeWebsiteLink.trim(),
        aadhaarNumber: aadhaarNumber.trim() || undefined,
      });

      Alert.alert(
        'Application Submitted',
        'Your application has been registered successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Unable to submit application right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <StatusBar
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Apply for this Scheme</Text>
          <Text style={styles.headerSubtitle}>{scheme.title}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.formContainer}>
          <View style={styles.scrollBlock}>
            <ScrollView
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Applicant Details</Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={applicantName}
                onChangeText={setApplicantName}
                placeholder="Full name"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                value={applicantMobileNumber}
                onChangeText={setApplicantMobileNumber}
                placeholder="Mobile number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={applicantAddress}
                onChangeText={setApplicantAddress}
                placeholder="City, Area Type"
                placeholderTextColor={theme.colors.textSecondary}
              />

              <Text style={styles.label}>Aadhaar Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={aadhaarNumber}
                onChangeText={setAadhaarNumber}
                placeholder="12-digit Aadhaar number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={12}
              />

              <TouchableOpacity
                style={styles.linkBox}
                onPress={() => {
                  const url =
                    schemeWebsiteLink.trim() || 'https://example.gov.in/scheme';
                  Linking.openURL(url).catch(() => {
                    Alert.alert(
                      'Unable to open link',
                      'Please try again later.',
                    );
                  });
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.linkLabel}>Official scheme website</Text>
                <Text style={styles.linkUrl}>
                  {schemeWebsiteLink || 'https://example.gov.in/scheme'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View style={styles.footerSticky}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                submitting && styles.applyButtonDisabled,
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.applyButtonText}>Apply</Text>
              )}
            </TouchableOpacity>
          </View>
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
  loaderWrap: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    marginTop: -12,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    overflow: 'hidden',
  },
  formContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: '#EAF0FF',
    ...theme.shadows.card,
    elevation: 8,
    padding: theme.spacing.l,
    overflow: 'hidden',
  },
  formContent: {
    paddingBottom: theme.spacing.l,
    gap: theme.spacing.s,
  },
  scrollBlock: {
    flex: 1,
  },
  footerSticky: {
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.s,
    paddingBottom: theme.spacing.s,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginTop: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  headerSubtitle: {
    marginTop: theme.spacing.xs,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  sectionTitle: {
    ...theme.typography.subHeader,
    marginBottom: theme.spacing.m,
  },
  linkBox: {
    backgroundColor: '#F1F8FF',
    borderWidth: 1,
    borderColor: '#B6D6F6',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.md,
  },
  linkLabel: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  linkUrl: {
    fontSize: 13,
    color: '#1278A1',
    textDecorationLine: 'underline',
  },
  label: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.s,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.s,
    color: theme.colors.textPrimary,
    backgroundColor: '#F9FBFF',
  },
  textArea: {
    minHeight: 100,
  },
  applyButton: {
    minHeight: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  applyButtonDisabled: {
    opacity: 0.7,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default SchemeApplyFormScreen;
