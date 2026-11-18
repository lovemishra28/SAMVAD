import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type HeaderContainerProps = {
  title: string;
  subtitle?: string;
  leftNode?: ReactNode;
  rightNode?: ReactNode;
};

const HeaderContainer = ({ title, subtitle, leftNode, rightNode }: HeaderContainerProps) => {
  return (
    <View style={styles.headerBar}>
      <View style={styles.sideSlot}>{leftNode}</View>

      <View style={styles.centerContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.sideSlot}>{rightNode}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.l,
    height: 118,
  },
  sideSlot: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default HeaderContainer;
