import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

type HeroContainerProps = {
  children: ReactNode;
  style?: ViewStyle;
};

const HeroContainer = ({ children, style }: HeroContainerProps) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: -6,
    paddingTop: theme.spacing.m,
    paddingHorizontal: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    zIndex: 1,
    elevation: 4,
  },
});

export default HeroContainer;
