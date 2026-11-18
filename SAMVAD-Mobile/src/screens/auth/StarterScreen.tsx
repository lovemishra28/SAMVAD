import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, ActivityIndicator, Image } from 'react-native';
import { theme } from '../../theme/theme';
import { getToken, authApi, clearAuth } from '../../api/client';

const StarterScreen = ({ navigation }: { navigation: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Fade-in + scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Check for existing valid session
    const checkSession = async () => {
      try {
        const token = await getToken();
        if (token) {
          // Validate token against server
          const res = await authApi.getMe();
          if (res?.user) {
            // Valid session — skip to main app
            navigation.replace('MainApp');
            return;
          }
        }
      } catch {
        // Token expired or invalid — clear and proceed to login
        await clearAuth();
      }

      setChecking(false);
      // Auto-navigate to Login after brief splash
      setTimeout(() => {
        navigation.replace('Login');
      }, 1200);
    };

    checkSession();
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image 
          source={require('../../assets/samvad_logo.png')} 
          style={styles.logoImage} 
          resizeMode="contain"
        />

        <Text style={styles.logoText}>SAMVAD</Text>
      </Animated.View>

      {checking ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={{ position: 'absolute', bottom: 80 }}
        />
      ) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: theme.spacing.l,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900', // extra bold
    color: theme.colors.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1,
  },
});

export default StarterScreen;
