import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import StarterScreen from '../screens/auth/StarterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';
import OnboardingOccupationScreen from '../screens/auth/OnboardingOccupationScreen';
import OnboardingEligibilityScreen from '../screens/auth/OnboardingEligibilityScreen';
import MainTabNavigator from './MainTabNavigator';
import SchemeDetailsScreen from '../screens/main/SchemeDetailsScreen';
import SchemeApplyFormScreen from '../screens/main/SchemeApplyFormScreen';
import FeedbackScreen from '../screens/main/FeedbackScreen';
import SchemeFeedbackScreen from '../screens/main/SchemeFeedbackScreen';
import CompleteProfileScreen from '../screens/main/CompleteProfileScreen';
import ContactUsScreen from '../screens/main/ContactUsScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Starter"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Starter" component={StarterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="OnboardingOccupation" component={OnboardingOccupationScreen} />
      <Stack.Screen name="OnboardingEligibility" component={OnboardingEligibilityScreen} />
      <Stack.Screen name="MainApp" component={MainTabNavigator} />
      <Stack.Screen name="SchemeDetails" component={SchemeDetailsScreen} />
      <Stack.Screen name="SchemeApplyForm" component={SchemeApplyFormScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="SchemeFeedbackDetail" component={SchemeFeedbackScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
