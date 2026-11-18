import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { authApi } from '../../api/client';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendOtp(mobile);
      navigation.navigate('Verify', { mobileNumber: mobile });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.wrapper}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top branded header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/samvad_logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>SAMVAD</Text>
        {/* <Text style={styles.headerSubtitle}>Citizen Services Portal</Text> */}
      </View>

      {/* Bottom white card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Login to your account</Text>
        <Text style={styles.cardCaption}>Enter your registered mobile number</Text>

        {/* Phone input row */}
        <View style={styles.inputRow}>
          <View style={styles.prefixContainer}>
            <Phone size={18} color={theme.colors.primary} />
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
            placeholderTextColor={theme.colors.textSecondary}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!mobile || loading) && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={!mobile || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flex: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: theme.spacing.m,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  card: {
    flex: 6,
    backgroundColor: '#F7F9FC',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  cardCaption: {
    ...theme.typography.label,
    marginBottom: theme.spacing.l,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.l,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: 52,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.s,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: theme.spacing.m,
    fontSize: 16,
    color: theme.colors.textPrimary,
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
  privacyText: {
    ...theme.typography.micro,
    textAlign: 'center',
    marginTop: theme.spacing.l,
    lineHeight: 16,
  },
});

export default LoginScreen;
