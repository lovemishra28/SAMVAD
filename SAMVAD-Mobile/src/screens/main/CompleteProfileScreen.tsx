import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { ArrowLeft, CircleCheck } from 'lucide-react-native';
import { theme } from '../../theme/theme';

const CompleteProfileScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Profile verification pending</Text>
          <Text style={styles.description}>
            Add your Aadhaar details and documents to unlock all eligible schemes.
          </Text>

          <View style={styles.checkItem}>
            <CircleCheck size={18} color={theme.colors.primary} />
            <Text style={styles.checkText}>Aadhaar verification</Text>
          </View>
          <View style={styles.checkItem}>
            <CircleCheck size={18} color={theme.colors.primary} />
            <Text style={styles.checkText}>Income certificate upload</Text>
          </View>
          <View style={styles.checkItem}>
            <CircleCheck size={18} color={theme.colors.primary} />
            <Text style={styles.checkText}>Occupation proof upload</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
  },
  headerTitle: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  spacer: {
    width: 22,
  },
  content: {
    padding: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.card,
  },
  title: {
    ...theme.typography.subHeader,
    marginBottom: theme.spacing.s,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    gap: 8,
  },
  checkText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    paddingVertical: 14,
    ...theme.shadows.button,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CompleteProfileScreen;
