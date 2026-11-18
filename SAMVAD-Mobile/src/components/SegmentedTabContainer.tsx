import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type SegmentedTabContainerProps = {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const SegmentedTabContainer = ({
  tabs,
  activeTab,
  onTabChange,
}: SegmentedTabContainerProps) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
          onPress={() => onTabChange(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: theme.spacing.m,
    paddingHorizontal: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.xs,
    borderWidth: 1.2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  activeTabButton: {
    backgroundColor: '#B7DBE8',
    borderColor: '#B7DBE8',
  },
  tabText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  activeTabText: {
    color: theme.colors.textPrimary,
  },
});

export default SegmentedTabContainer;
