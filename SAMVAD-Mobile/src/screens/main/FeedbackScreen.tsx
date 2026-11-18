import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  ChevronRight,
  Send,
  CheckCircle,
  FileText,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import SegmentedTabContainer from '../../components/SegmentedTabContainer';
import { mobileApi } from '../../api/client';

const TABS = ['Scheme Feedback', 'Suggestions'];

const FeedbackScreen = () => {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Suggestion state
  const [suggestion, setSuggestion] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const data = await mobileApi.getSchemes();
      setSchemes(data.schemes || []);
    } catch (err) {
      console.warn('Failed to load schemes for feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSuggestion = async () => {
    if (!suggestion.trim()) return;
    try {
      setSubmittingSuggestion(true);
      await mobileApi.submitFeedback({
        type: 'suggestion',
        suggestionText: suggestion.trim(),
      });
      setSuggestion('');
      setSuccessMessage('Your suggestion has been submitted successfully.');
      setShowSuccess(true);
    } catch (err) {
      console.warn('Failed to submit suggestion:', err);
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  const renderSchemeList = () => {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading schemes...</Text>
        </View>
      );
    }

    if (schemes.length === 0) {
      return (
        <View style={styles.centerBox}>
          <FileText size={40} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No schemes found for your profile.</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.schemeList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentPaddingBottom}
      >
        <Text style={styles.sectionSubtitle}>
          Tap a scheme to give your rating and feedback
        </Text>
        {schemes.map((scheme: any, index: number) => (
          <TouchableOpacity
            key={scheme.scheme_id || scheme._id || index}
            style={styles.schemeCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('SchemeFeedbackDetail', {
                schemeId: scheme.scheme_id,
                schemeName: scheme.scheme_name,
                description: scheme.description || '',
              })
            }
          >
            <View style={styles.schemeCardContent}>
              <View style={styles.schemeIconBox}>
                <FileText size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.schemeInfo}>
                <Text style={styles.schemeName} numberOfLines={2}>
                  {scheme.scheme_name}
                </Text>
                <Text style={styles.schemeCategory} numberOfLines={1}>
                  {scheme.target_occupation || 'General'} • {scheme.benefit_type || 'Benefit'}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderSuggestions = () => (
    <ScrollView
      style={styles.suggestionsContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentPaddingBottom}
    >
      <Text style={styles.sectionSubtitle}>
        Share your general ideas, thoughts, or suggestions
      </Text>

      <View style={styles.inputBox}>
        <TextInput
          placeholder="Write your suggestion here..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          value={suggestion}
          onChangeText={setSuggestion}
          style={styles.input}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.submitBtn,
          !suggestion.trim() && styles.submitBtnDisabled,
        ]}
        onPress={handleSubmitSuggestion}
        disabled={!suggestion.trim() || submittingSuggestion}
      >
        {submittingSuggestion ? (
          <ActivityIndicator size="small" color={theme.colors.white} />
        ) : (
          <>
            <Send size={18} color={theme.colors.white} />
            <Text style={styles.submitText}>Submit Suggestion</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.screenCard}>
          <View style={styles.heroTopInfo}>
            <Text style={styles.heroTitle}>Give feedback or suggestions</Text>
            <Text style={styles.heroSubtitle}>Your input helps us improve scheme experience for everyone.</Text>
          </View>

          <View style={styles.tabWrapper}>
            <SegmentedTabContainer
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </View>

          <View style={styles.tabContentWrapper}>
            {activeTab === TABS[0] ? renderSchemeList() : renderSuggestions()}
          </View>
        </View>
      </View>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CheckCircle size={50} color="#2B9D5A" />
            <Text style={styles.modalTitle}>Thank You!</Text>
            <Text style={styles.modalText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

  tabContentWrapper: {
    flex: 1,
    paddingBottom: theme.spacing.l,
  },

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

  /* HEADER */
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxl, // shifted further down
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
  },

  /* TABS */
  tabWrapper: {
    paddingHorizontal: theme.spacing.m,
    marginTop: theme.spacing.s,
  },

  /* SCHEME LIST */
  sectionSubtitle: {
    ...theme.typography.caption,
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  schemeList: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
  },
  schemeCard: {
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.card,
  },
  schemeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  schemeIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#E6F7FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schemeInfo: {
    flex: 1,
    marginRight: 8,
  },
  schemeName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 3,
  },
  schemeCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  /* SUGGESTIONS */
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.m,
  },
  inputBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    minHeight: 160,
    ...theme.shadows.card,
  },
  input: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 140,
  },
  submitBtn: {
    marginTop: theme.spacing.l,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  /* EMPTY / LOADING */
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    ...theme.typography.caption,
  },
  emptyText: {
    marginTop: 12,
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: theme.colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  modalText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  modalBtn: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contentPaddingBottom: {
    paddingBottom: 40,
  },

  modalBtnText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});

export default FeedbackScreen;