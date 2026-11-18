import React, { useState, useEffect } from 'react';
import {
  Animated,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../../theme/theme';
import { authApi, saveUserProfile } from '../../api/client';

// ─── Income bracket options ────────────────────────────────────────
const INCOME_OPTIONS = [
  { id: 'below_1_5', label: 'Below ₹1,50,000' },
  { id: '1_5_to_3', label: '₹1,50,001 – ₹3,00,000' },
  { id: '3_to_6', label: '₹3,00,001 – ₹6,00,000' },
  { id: '6_to_10', label: '₹6,00,001 – ₹10,00,000' },
  { id: 'above_10', label: 'Above ₹10,00,000' },
];

// ─── Occupation → visible fields mapping ───────────────────────────
const OCCUPATION_FIELDS: Record<string, { income: boolean; pwd: boolean; bpl: boolean; scst: boolean }> = {
  'Student':             { income: true, pwd: true, bpl: true, scst: true },
  'Farmer':              { income: true, pwd: true, bpl: true, scst: true },
  'Worker':              { income: true, pwd: true, bpl: true, scst: true },
  'Senior Citizen':      { income: true, pwd: true, bpl: true, scst: true },
  'Government Employee': { income: true, pwd: true, bpl: true, scst: true },
};

const OnboardingEligibilityScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const occupation = route?.params?.occupation || '';
  const interests: string[] = route?.params?.interests || [];
  const fields = OCCUPATION_FIELDS[occupation] || { income: true, pwd: true, bpl: true, scst: true };

  const [incomeRange, setIncomeRange] = useState<string>('');
  const [pwdStatus, setPwdStatus] = useState<boolean | null>(null);
  const [bplStatus, setBplStatus] = useState<boolean | null>(null);
  const [scstStatus, setScstStatus] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('Saving your details...');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate required fields
    if (fields.income && !incomeRange) {
      Alert.alert('Required', 'Please select your household income range.');
      return;
    }
    if (fields.pwd && pwdStatus === null) {
      Alert.alert('Required', 'Please indicate your PwD status.');
      return;
    }
    if (fields.bpl && bplStatus === null) {
      Alert.alert('Required', 'Please indicate your BPL status.');
      return;
    }
    if (fields.scst && scstStatus === null) {
      Alert.alert('Required', 'Please indicate your SC/ST status.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Saving your eligibility details...');

    try {
      const profileData: any = { occupation, interests };
      if (fields.income) profileData.incomeRange = incomeRange;
      if (fields.pwd) profileData.pwdStatus = pwdStatus;
      if (fields.bpl) profileData.bplStatus = bplStatus;
      if (fields.scst) profileData.scstStatus = scstStatus;

      const res = await authApi.updateProfile(profileData);
      await saveUserProfile(res.user);
      setSubmitMessage('Done. Taking you to your dashboard...');
      setTimeout(() => navigation.replace('MainApp'), 650);
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    }
  };

  const renderYesNo = (
    label: string,
    description: string,
    value: boolean | null,
    onChange: (v: boolean) => void,
  ) => (
    <View style={styles.questionBlock}>
      <Text style={styles.questionLabel}>{label}</Text>
      <Text style={styles.questionDesc}>{description}</Text>
      <View style={styles.yesNoRow}>
        <TouchableOpacity
          style={[styles.yesNoBtn, value === true && styles.yesNoBtnSelected]}
          onPress={() => onChange(true)}
          activeOpacity={0.85}
        >
          <Text style={[styles.yesNoText, value === true && styles.yesNoTextSelected]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.yesNoBtn, value === false && styles.yesNoBtnSelected]}
          onPress={() => onChange(false)}
          activeOpacity={0.85}
        >
          <Text style={[styles.yesNoText, value === false && styles.yesNoTextSelected]}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.backgroundTop} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.stepBadge}>Eligibility Check</Text>
          <Text style={styles.title}>A few more questions</Text>
          <Text style={styles.subtitle}>
            This helps us find the most relevant government schemes for you.
          </Text>

          {/* Income Range */}
          {fields.income && (
            <View style={styles.questionBlock}>
              <Text style={styles.questionLabel}>
                What's your yearly household income?
              </Text>
              <Text style={styles.questionDesc}>
                Select the range that best matches your family's total annual income.
              </Text>
              <View style={styles.incomeGrid}>
                {INCOME_OPTIONS.map(option => {
                  const isSelected = incomeRange === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.incomeCard, isSelected && styles.incomeCardSelected]}
                      onPress={() => setIncomeRange(option.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.incomeLabel, isSelected && styles.incomeLabelSelected]}>
                        {option.label}
                      </Text>
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* PwD Status */}
          {fields.pwd &&
            renderYesNo(
              'Do you have a disability certificate (PwD)?',
              'Persons with Disabilities are eligible for additional government schemes and benefits.',
              pwdStatus,
              setPwdStatus,
            )}

          {/* BPL Status */}
          {fields.bpl &&
            renderYesNo(
              'Does your family hold a BPL card?',
              'Below Poverty Line families qualify for special welfare schemes and subsidies.',
              bplStatus,
              setBplStatus,
            )}

          {/* SC/ST Status */}
          {fields.scst &&
            renderYesNo(
              'Do you belong to SC/ST category?',
              'Scheduled Caste / Scheduled Tribe members have access to reserved government programmes.',
              scstStatus,
              setScstStatus,
            )}

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.submitOverlay}>
          <View style={styles.submitCard}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.submitMessage}>{submitMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E9EDFB' },
  backgroundTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 220,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  scrollContent: { paddingHorizontal: 10, paddingTop: 48, paddingBottom: theme.spacing.xl },
  card: {
    backgroundColor: '#F7F8FD', borderRadius: 28,
    paddingHorizontal: 18, paddingVertical: theme.spacing.l,
    borderWidth: 1, borderColor: '#E7ECFA', ...theme.shadows.card,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3EEF9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    fontSize: 12, fontWeight: '700', color: '#3C6A94', marginBottom: theme.spacing.s,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28, lineHeight: 34, color: '#262E4D', fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 15, lineHeight: 22, color: '#59627D', marginBottom: theme.spacing.l,
  },
  questionBlock: { marginBottom: theme.spacing.l },
  questionLabel: {
    fontSize: 16, lineHeight: 22, color: '#2A3150', fontWeight: '700',
    marginBottom: 4,
  },
  questionDesc: {
    fontSize: 13, lineHeight: 19, color: '#7584A6', marginBottom: theme.spacing.m,
  },
  incomeGrid: { gap: 8 },
  incomeCard: {
    borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: '#CBD8F1',
    backgroundColor: '#F4F7FF', paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  incomeCardSelected: { borderColor: '#91B7E8', backgroundColor: '#E3EEF9' },
  incomeLabel: { fontSize: 15, color: '#2D3552', fontWeight: '500' },
  incomeLabelSelected: { color: '#1B5E96', fontWeight: '700' },
  checkMark: {
    width: 22, height: 22, borderRadius: 11, overflow: 'hidden',
    textAlign: 'center', lineHeight: 22, fontWeight: '700',
    color: theme.colors.white, backgroundColor: '#168FC8', fontSize: 13,
  },
  yesNoRow: { flexDirection: 'row', gap: 12 },
  yesNoBtn: {
    flex: 1, borderRadius: theme.borderRadius.lg, borderWidth: 1,
    borderColor: '#CBD8F1', backgroundColor: '#F4F7FF',
    paddingVertical: 14, alignItems: 'center',
  },
  yesNoBtnSelected: { borderColor: '#91B7E8', backgroundColor: '#E3EEF9' },
  yesNoText: { fontSize: 16, fontWeight: '600', color: '#2D3552' },
  yesNoTextSelected: { color: '#1B5E96', fontWeight: '700' },
  submitBtn: {
    marginTop: theme.spacing.s, height: 58, borderRadius: 30,
    backgroundColor: '#20A3DA', justifyContent: 'center', alignItems: 'center',
    ...theme.shadows.button,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: theme.colors.white, fontSize: 20, fontWeight: '700' },
  submitOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 27, 52, 0.28)', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 28,
  },
  submitCard: {
    width: '100%', maxWidth: 360, borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 22, backgroundColor: '#F8FAFF',
    borderWidth: 1, borderColor: '#D4E0F6', alignItems: 'center', ...theme.shadows.card,
  },
  submitMessage: {
    marginTop: 12, fontSize: 16, lineHeight: 22,
    color: '#35406A', textAlign: 'center', fontWeight: '600',
  },
});

export default OnboardingEligibilityScreen;
