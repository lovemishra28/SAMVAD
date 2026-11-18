import React, { useState } from 'react';
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
import { ArrowLeft, Star, Send, CheckCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { mobileApi } from '../../api/client';

const SchemeFeedbackScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { schemeId, schemeName, description } = route.params || {};

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      setSubmitting(true);
      await mobileApi.submitFeedback({
        type: 'scheme_feedback',
        schemeId,
        schemeName,
        rating,
        note: note.trim(),
      });
      setShowSuccess(true);
      setRating(0);
      setNote('');
    } catch (err) {
      console.warn('Failed to submit scheme feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Scheme Feedback
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.screenCard}>
          <View style={styles.heroTopInfo}>
            <Text style={styles.heroTitle}>Scheme Feedback</Text>
            <Text style={styles.heroSubtitle}>Rate this scheme and share your experience.</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
          {/* SCHEME INFO */}
          <View style={styles.schemeInfoCard}>
            <Text style={styles.schemeNameText}>{schemeName}</Text>
            {description ? (
              <Text style={styles.schemeDescText}>{description}</Text>
            ) : null}
          </View>

          {/* RATING */}
          <Text style={styles.sectionTitle}>Rate this Scheme</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                >
                  <Star
                    size={36}
                    color={star <= rating ? '#FFD700' : '#D1D5DB'}
                    fill={star <= rating ? '#FFD700' : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>{ratingLabels[rating]}</Text>
            )}
          </View>

          {/* NOTE */}
          <Text style={styles.sectionTitle}>Your Feedback (Optional)</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Share your experience with this scheme..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              value={note}
              onChangeText={setNote}
              style={styles.input}
              textAlignVertical="top"
            />
          </View>

          {/* SUBMIT */}
          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <>
                <Send size={18} color={theme.colors.white} />
                <Text style={styles.submitText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
        </View>
      </View>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CheckCircle size={50} color="#2B9D5A" />
            <Text style={styles.modalTitle}>Thank You!</Text>
            <Text style={styles.modalText}>
              Your feedback for "{schemeName}" has been submitted successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
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
    flex: 1,
    textAlign: 'center',
  },

  /* SCROLL */
  scrollContent: {
    paddingHorizontal: theme.spacing.m,
    paddingBottom: 40,
  },

  /* SCHEME INFO */
  schemeInfoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  schemeNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  schemeDescText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  /* SECTION TITLE */
  sectionTitle: {
    ...theme.typography.subHeader,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.m,
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

  /* RATING */
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.m,
    ...theme.shadows.card,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 16,
  },
  starBtn: {
    padding: 4,
  },
  ratingLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  /* INPUT */
  inputBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    minHeight: 120,
    ...theme.shadows.card,
  },
  input: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    minHeight: 100,
  },

  /* BUTTON */
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
  modalBtnText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});

export default SchemeFeedbackScreen;
