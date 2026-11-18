import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { CheckCircle2, FileText, ArrowLeft } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { mobileApi } from '../../api/client';

type SchemeData = {
  id?: string;
  title: string;
  desc?: string;
  schemeId?: string;
  deadline?: string;
  eligibility?:
    | string
    | {
        rawText?: string;
        maxIncomeBracket?: string | null;
        requiresPwd?: boolean;
        requiresBpl?: boolean;
        requiresScst?: boolean;
      };
  benefit_type?: string;
  target_occupation?: string;
  target_interest?: string;
  isApplied?: boolean;
  appliedAt?: string;
};

const SchemeDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const scheme: SchemeData | null = route.params?.scheme ?? null;
  const hasInvalidScheme = !scheme || !scheme.title;
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [applied, setApplied] = useState(!!scheme?.isApplied);

  useFocusEffect(
    useCallback(() => {
      const checkAppliedStatus = async () => {
        if (!scheme?.schemeId) {
          return;
        }

        setLoadingStatus(true);
        try {
          const res = await mobileApi.getSchemeAppliedStatus(scheme.schemeId);
          setApplied(!!res?.isApplied);
        } catch {
          setApplied(!!scheme?.isApplied);
        } finally {
          setLoadingStatus(false);
        }
      };

      checkAppliedStatus();
    }, [scheme?.schemeId, scheme?.isApplied]),
  );

  // Error state - show error message instead of blank screen
  if (hasInvalidScheme) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scheme Details</Text>
        </View>
        <View style={[styles.body, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 16, color: theme.colors.textSecondary, marginBottom: 16 }}>
            Unable to load scheme details.
          </Text>
          <TouchableOpacity
            style={{ paddingHorizontal: 24, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 8 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: theme.colors.white, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const handleApplyNavigation = () => {
    // Allow the user to proceed to the application form even if schemeId is missing;
    // the form can still submit with a scheme title fallback.
    navigation.navigate('SchemeApplyForm', { scheme });
  };

  // Parse eligibility from either string or structured object
  const eligibilityItems = (() => {
    const rawEligibility = scheme?.eligibility;

    if (!rawEligibility) {
      return [
        'Applicant should meet notified criteria',
        'Applicant should provide valid documents',
        'Final eligibility is subject to verification',
      ];
    }

    if (typeof rawEligibility === 'string') {
      return rawEligibility
        .split(/[;,.]/)
        .filter(e => e.trim())
        .map(e => e.trim());
    }

    const items: string[] = [];
    if (rawEligibility.rawText) items.push(rawEligibility.rawText);
    if (rawEligibility.requiresBpl) items.push('BPL certificate required');
    if (rawEligibility.requiresScst) items.push('SC/ST certificate required');
    if (rawEligibility.requiresPwd) items.push('PwD certificate required');
    if (rawEligibility.maxIncomeBracket) {
      items.push(`Income bracket up to ${rawEligibility.maxIncomeBracket}`);
    }

    return items.length > 0
      ? items
      : [
          'Applicant should meet notified criteria',
          'Applicant should provide valid documents',
          'Final eligibility is subject to verification',
        ];
  })();

  return (
    <View style={styles.mainContainer}>
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

        <Text style={styles.headerTitle}>{scheme?.title || 'Scheme Details'}</Text>
        {scheme?.benefit_type && (
          <Text style={styles.headerSubtitle}>{scheme.benefit_type}</Text>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.bodyContentBox}>
          <ScrollView
            contentContainerStyle={styles.bodyScroll}
            showsVerticalScrollIndicator={false}
          >
            {scheme?.benefit_type && (
              <View style={styles.card}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.iconCircle}>
                    <CheckCircle2 size={16} color={theme.colors.success} />
                  </View>
                  <Text style={styles.sectionTitle}>Benefit</Text>
                </View>
                <Text style={styles.sectionBody}>{scheme.benefit_type}</Text>
              </View>
            )}

            {scheme?.desc && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>About This Scheme</Text>
                <Text style={styles.sectionBody}>{scheme.desc}</Text>
              </View>
            )}

            {(scheme?.target_occupation || scheme?.target_interest) && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Target Audience</Text>
                {scheme.target_occupation && (
                  <View style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>Occupation: {scheme.target_occupation}</Text>
                  </View>
                )}
                {scheme.target_interest && (
                  <View style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>Interest/Category: {scheme.target_interest}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
              {eligibilityItems.map(item => (
                <View key={item} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {scheme?.deadline && (
              <View style={styles.card}>
                <View style={styles.sectionTitleRow}>
                  <FileText size={16} color="#5046B5" />
                  <Text style={styles.sectionTitle}>Important Dates</Text>
                </View>
                <Text style={styles.sectionBody}>
                  Deadline: {scheme.deadline}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footerButtonWrap}>
            {loadingStatus ? (
              <View style={styles.loadingStatusWrap}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : applied ? (
              <View style={styles.alreadyAppliedWrap}>
                <Text style={styles.alreadyAppliedText}>Already Applied</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.85}
                onPress={handleApplyNavigation}
              >
                <Text style={styles.applyButtonText}>
                  Apply for This Scheme
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.primary },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.l,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: theme.spacing.s,
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  headerSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    marginTop: -14,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.s,
    overflow: 'hidden',
  },
  bodyContentBox: {
    flex: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: '#DDE5FB',
    padding: theme.spacing.m,
    overflow: 'hidden',
    ...theme.shadows.card,
    elevation: 8,
  },
  bodyScroll: { gap: theme.spacing.m, paddingBottom: theme.spacing.xl },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#EBEDF7',
    ...theme.shadows.card,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CFF6DD',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C1533',
    marginBottom: 8,
  },
  sectionBody: { fontSize: 14, color: '#2E3550', lineHeight: 24 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: { flex: 1, fontSize: 15, color: '#2E3550', lineHeight: 22 },
  loadingStatusWrap: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s,
  },
  alreadyAppliedWrap: {
    minHeight: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s,
    backgroundColor: theme.colors.badgeSuccessBg,
    borderWidth: 1,
    borderColor: '#BFE7CD',
  },
  alreadyAppliedText: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#0898BB',
    minHeight: 52,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.s,
    paddingVertical: 10,
    ...theme.shadows.button,
  },
  footerButtonWrap: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: '#E8EBF9',
    backgroundColor: 'transparent',
    paddingBottom: theme.spacing.l,
  },
  applyButtonText: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default SchemeDetailsScreen;
