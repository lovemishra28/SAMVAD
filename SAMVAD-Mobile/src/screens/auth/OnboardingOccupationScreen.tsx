import React, { useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  Easing,
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

const CATEGORIES = [
  { id: 'Worker', label: 'Worker', iconText: 'WK' },
  { id: 'Farmer', label: 'Farmer', iconText: 'FA' },
  { id: 'Student', label: 'Student', iconText: 'ST' },
  { id: 'Senior Citizen', label: 'Senior Citizen', iconText: 'SC' },
  { id: 'Government Employee', label: 'Govt. Employee', iconText: 'GE' },
];

const INTERESTS = [
  { id: 'agriculture', label: 'Agriculture', icon: 'AG' },
  { id: 'arts', label: 'Arts', icon: 'AR' },
  { id: 'community', label: 'Community', icon: 'CM' },
  { id: 'education', label: 'Education', icon: 'ED' },
  { id: 'environment', label: 'Environment', icon: 'EN' },
  { id: 'finance', label: 'Finance', icon: 'FI' },
  { id: 'health', label: 'Health', icon: 'HE' },
  { id: 'sports', label: 'Sports', icon: 'SP' },
  { id: 'technology', label: 'Technology', icon: 'TE' },
  { id: 'welfare', label: 'Welfare', icon: 'WF' },
];

const TOTAL_STEPS = 2;
const SCROLL_SIDE_PADDING = 10;
const CARD_SIDE_PADDING = 10;
const PAGE_WIDTH =
  Dimensions.get('window').width - SCROLL_SIDE_PADDING * 2 - CARD_SIDE_PADDING * 2;

const OnboardingOccupationScreen = ({ navigation }: { navigation: any }) => {
  const [selectedOccupation, setSelectedOccupation] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('Submitting your details...');
  const sliderX = useRef(new Animated.Value(0)).current;

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const goNext = async () => {
    if (currentQuestion === TOTAL_STEPS - 1) {
      // Submit
      if (isSubmitting) return;

      if (!selectedOccupation) {
        Alert.alert('Required', 'Please select your category first.', [
          { text: 'OK', onPress: () => goPrevious() },
        ]);
        return;
      }
      if (selectedInterests.length === 0) {
        Alert.alert('Required', 'Please select at least one interest.');
        return;
      }

      setSubmitMessage('Preparing eligibility check...');
      setIsSubmitting(true);

      try {
        // Navigate to eligibility screen with occupation + interests
        setSubmitMessage('Almost there...');
        setTimeout(() => {
          setIsSubmitting(false);
          navigation.replace('OnboardingEligibility', {
            occupation: selectedOccupation,
            interests: selectedInterests,
          });
        }, 400);
      } catch (error: any) {
        setIsSubmitting(false);
        Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
      }
      return;
    }

    if (currentQuestion === 0 && !selectedOccupation) {
      Alert.alert('Required', 'Please select your category.');
      return;
    }

    const nextIndex = currentQuestion + 1;
    Animated.timing(sliderX, {
      toValue: -PAGE_WIDTH * nextIndex,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setCurrentQuestion(nextIndex));
  };

  const goPrevious = () => {
    if (currentQuestion === 0 || isSubmitting) return;

    const previousIndex = currentQuestion - 1;
    Animated.timing(sliderX, {
      toValue: -PAGE_WIDTH * previousIndex,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setCurrentQuestion(previousIndex));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      <View style={styles.backgroundTop} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.stepText}>Step {currentQuestion + 1} of {TOTAL_STEPS}</Text>

          <View style={styles.sliderMask}>
            <Animated.View
              style={[
                styles.sliderTrack,
                { width: PAGE_WIDTH * TOTAL_STEPS, transform: [{ translateX: sliderX }] },
              ]}
            >
              {/* STEP 1: Category */}
              <View style={[styles.questionPage, { width: PAGE_WIDTH }]}> 
                <Text style={styles.title}>Let&apos;s get to know you better</Text>
                <Text style={styles.subtitle}>
                  Select your category so we can recommend the right schemes.
                </Text>

                <Text style={styles.question}>What is your category?</Text>

                <View style={styles.optionsGrid}>
                  {CATEGORIES.map(option => {
                    const isSelected = selectedOccupation === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                        onPress={() => setSelectedOccupation(option.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.optionIconBadge}>
                          <Text style={styles.optionIconText}>{option.iconText}</Text>
                        </View>
                        <View style={styles.optionLabelWrap}>
                          <Text style={styles.optionLabel} numberOfLines={1} ellipsizeMode="tail">
                            {option.label}
                          </Text>
                        </View>

                        {isSelected ? <Text style={styles.checkMark}>✓</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* STEP 2: Interests */}
              <View style={[styles.questionPage, { width: PAGE_WIDTH }]}> 
                <Text style={styles.titleSecondary}>What are your interests?</Text>
                <Text style={styles.subtitle}>
                  Select the types of schemes you&apos;re interested in.
                </Text>

                <View style={styles.optionsGrid}>
                  {INTERESTS.map(option => {
                    const isSelected = selectedInterests.includes(option.id);
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                        onPress={() => toggleInterest(option.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.optionIconBadge}>
                          <Text style={styles.optionIconText}>{option.icon}</Text>
                        </View>
                        <View style={styles.optionLabelWrap}>
                          <Text style={styles.optionLabel} numberOfLines={1} ellipsizeMode="tail">
                            {option.label}
                          </Text>
                        </View>

                        {isSelected ? <Text style={styles.checkMark}>✓</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>
          </View>

          <View style={styles.dotsContainer}>
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentQuestion ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            {currentQuestion > 0 ? (
              <TouchableOpacity
                style={[styles.previousButton, isSubmitting && styles.nextButtonDisabled]}
                onPress={goPrevious}
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                <Text style={styles.previousArrowText}>{'<'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.nextButton,
                currentQuestion > 0 && styles.nextButtonWithPrevious,
                isSubmitting && styles.nextButtonDisabled,
              ]}
              onPress={goNext}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion === TOTAL_STEPS - 1 ? 'Submit' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {isSubmitting ? (
        <View style={styles.submitOverlay}>
          <View style={styles.submitCard}>
            <ActivityIndicator size="large" color="#1B98D3" />
            <Text style={styles.submitMessage}>{submitMessage}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E9EDFB' },
  backgroundTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 240, backgroundColor: theme.colors.primary, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  scrollContent: { paddingHorizontal: SCROLL_SIDE_PADDING, paddingTop: 58, paddingBottom: theme.spacing.xl },
  card: { backgroundColor: '#F7F8FD', borderRadius: 28, paddingHorizontal: CARD_SIDE_PADDING, paddingVertical: theme.spacing.l, borderWidth: 1, borderColor: '#E7ECFA', ...theme.shadows.card },
  stepText: { fontSize: 16, color: '#7584A6', marginBottom: theme.spacing.m },
  sliderMask: { overflow: 'hidden', width: PAGE_WIDTH },
  sliderTrack: { flexDirection: 'row', alignItems: 'flex-start' },
  questionPage: { paddingRight: 2 },
  title: { fontSize: 30, lineHeight: 36, color: '#262E4D', fontWeight: '700', marginBottom: theme.spacing.s },
  titleSecondary: { fontSize: 46, lineHeight: 50, color: '#2F3758', fontWeight: '700', marginBottom: theme.spacing.s },
  subtitle: { fontSize: 16, lineHeight: 24, color: '#59627D', marginBottom: theme.spacing.l },
  question: { fontSize: 18, lineHeight: 24, color: '#2A3150', fontWeight: '700', marginBottom: theme.spacing.m },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginBottom: theme.spacing.l },
  optionCard: { width: '49%', minHeight: 76, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: '#CBD8F1', backgroundColor: '#F4F7FF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingRight: 12, paddingVertical: 10, position: 'relative' },
  optionCardSelected: { borderColor: '#91B7E8', backgroundColor: '#E3EEF9' },
  optionIconBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D9E8FA', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  optionIconText: { fontSize: 12, fontWeight: '700', color: '#3C4A70' },
  optionLabelWrap: { flex: 1, justifyContent: 'center', minHeight: 20 },
  optionLabel: { fontSize: 14, lineHeight: 19, color: '#2D3552', fontWeight: '500', flexShrink: 1, includeFontPadding: false },
  checkMark: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, overflow: 'hidden', textAlign: 'center', lineHeight: 22, fontWeight: '700', color: theme.colors.white, backgroundColor: '#168FC8', fontSize: 13 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: theme.spacing.l },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#BFCDE8' },
  dotActive: { backgroundColor: '#178ECE' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', columnGap: 10 },
  previousButton: { width: 54, height: 54, borderRadius: 27, borderWidth: 1, borderColor: '#BFD3EE', backgroundColor: '#F4F8FF', justifyContent: 'center', alignItems: 'center' },
  previousArrowText: { fontSize: 28, color: '#3A4E75', fontWeight: '700', lineHeight: 28 },
  nextButton: { alignSelf: 'center', width: 270, height: 58, borderRadius: 30, backgroundColor: '#20A3DA', justifyContent: 'center', alignItems: 'center', ...theme.shadows.button },
  nextButtonWithPrevious: { width: 234 },
  nextButtonDisabled: { opacity: 0.8 },
  nextButtonText: { color: theme.colors.white, fontSize: 32, fontWeight: '700' },
  submitOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18, 27, 52, 0.28)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  submitCard: { width: '100%', maxWidth: 360, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 22, backgroundColor: '#F8FAFF', borderWidth: 1, borderColor: '#D4E0F6', alignItems: 'center', ...theme.shadows.card },
  submitMessage: { marginTop: 12, fontSize: 16, lineHeight: 22, color: '#35406A', textAlign: 'center', fontWeight: '600' },
});

export default OnboardingOccupationScreen;
