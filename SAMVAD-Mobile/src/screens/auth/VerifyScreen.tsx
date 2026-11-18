import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { authApi, saveToken, saveUserProfile } from '../../api/client';

const OTP_LENGTH = 6;

const VerifyScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const mobileNumber = route?.params?.mobileNumber || '';
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      await authApi.sendOtp(mobileNumber);
      setTimer(60);
      Alert.alert('OTP Resent', 'A new OTP has been sent to your mobile.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP.');
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      const response = await authApi.verifyOtp(mobileNumber, otpCode);

      // Store JWT token and user profile
      await saveToken(response.token);
      await saveUserProfile(response.user);

      const occupation = (response?.user?.occupation || '').trim();
      const interests = Array.isArray(response?.user?.interests)
        ? response.user.interests
        : [];
      const hasOnboardingBasics = occupation.length > 0 && interests.length > 0;

      // First-time users must complete eligibility. If occupation/interests already
      // exist in voter data, skip occupation step and go directly to eligibility.
      if (response.needsEligibility) {
        if (hasOnboardingBasics) {
          navigation.replace('OnboardingEligibility', {
            occupation,
            interests,
          });
        } else {
          navigation.replace('OnboardingOccupation');
        }
        return;
      }

      if (response.needsOnboarding || !hasOnboardingBasics) {
        navigation.replace('OnboardingOccupation');
      } else {
        navigation.replace('MainApp');
      }
    } catch (error: any) {
      if (error.status === 403) {
        Alert.alert(
          'Access Denied',
          'This mobile number is not registered in the voter list. Please contact your local representative.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Verification Failed', error.message || 'Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <View style={styles.wrapper}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* Top header */}
      <View style={styles.header}>
        <ShieldCheck size={48} color={theme.colors.white} />
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <Text style={styles.headerSubtitle}>
          We've sent a {OTP_LENGTH}-digit code to +91 {mobileNumber}
        </Text>
      </View>

      {/* Bottom card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Enter Verification Code</Text>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={val => handleChange(val, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Resend / Timer */}
        <View style={styles.timerRow}>
          {timer > 0 ? (
            <Text style={styles.timerText}>
              Resend OTP in <Text style={styles.timerBold}>00:{timer.toString().padStart(2, '0')}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, (!isOtpComplete || loading) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={!isOtpComplete || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    flex: 3.5,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: theme.spacing.m,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    flex: 6.5,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: theme.spacing.l,
  },
  otpBox: {
    width: 46,
    height: 52,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.background,
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timerText: {
    ...theme.typography.label,
  },
  timerBold: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  resendText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.button,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default VerifyScreen;
