import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Animated,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Bell,
  TrendingUp,
  ClipboardList,
  X,
} from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { mobileApi, getCachedUser } from '../../api/client';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(340)).current;

  const [userName, setUserName] = useState('User');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Track already-applied scheme IDs for UI state
  const appliedSchemeIds = new Set(applications.map(app => app.schemeId));

  const loadData = useCallback(async () => {
    try {
      const user = await getCachedUser();
      if (user?.name) setUserName(user.name);

      const [recoRes, notifRes, appRes] = await Promise.all([
        mobileApi
          .getMyRecommendations()
          .catch(() => ({ schemes: [], found: false })),
        mobileApi.getNotifications().catch(() => ({ notifications: [] })),
        mobileApi.getApplications().catch(() => ({ applications: [] })),
      ]);

      setRecommendations((recoRes.schemes || []).slice(0, 5));
      setNotifications(notifRes.notifications || []);
      setUnreadCount(
        typeof notifRes.unreadCount === 'number'
          ? notifRes.unreadCount
          : (notifRes.notifications || []).filter((n: any) => n.isUnread)
              .length,
      );
      setApplications(appRes.applications || []);
    } catch {
      // Fallback silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 20000);

    return () => clearInterval(interval);
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Compute stats
  const activeSchemeCount = recommendations.length;
  // Let "Applied" reflect all applications they've submitted regardless of pending/applied backend status since we don't have pending concept for voters
  const appliedCount = applications.length;

  const stats = [
    {
      icon: TrendingUp,
      label: 'Active Schemes',
      value: String(activeSchemeCount),
      color: theme.colors.primary,
    },
    {
      icon: ClipboardList,
      label: 'Applied',
      value: String(appliedCount),
      color: theme.colors.success,
    },
  ];

  const handleOpenNotifications = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
    mobileApi
      .markAllNotificationsRead()
      .then(() => {
        loadData();
      })
      .catch(() => {
        // Keep optimistic UI; next poll/focus fetch will reconcile state.
      });

    setIsNotificationOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseNotifications = () => {
    Animated.timing(slideAnim, {
      toValue: 340,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setIsNotificationOpen(false));
  };

  const handleOpenScheme = (scheme: any) => {
    navigation.navigate('SchemeDetails', { scheme });
  };

  // Flatten notification schemes for the panel
  const notificationItems = notifications.flatMap(n =>
    (n.schemes || []).map((s: any) => ({
      id: `${n._id}_${s.schemeId}`,
      title: s.schemeName,
      date: new Date(n.sentAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      benefit_type: s.benefit_type || '',
      schemeId: s.schemeId,
    })),
  );

  if (loading) {
    return (
      <View
        style={[
          styles.mainContainer,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <StatusBar
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
      />

      {/* Header bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerSideSpacer} />
        <View style={styles.headerCenterContent}>
          <Text style={styles.headerWelcome}>WELCOME!</Text>
          <Text style={styles.headerName}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={handleOpenNotifications}
          activeOpacity={0.8}
        >
          <Bell size={22} color={theme.colors.white} />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            {stats.map(stat => (
              <View
                key={stat.label}
                style={[styles.statCard, { borderTopColor: stat.color }]}
              >
                <View
                  style={[
                    styles.statIconWrap,
                    { backgroundColor: `${stat.color}1A` },
                  ]}
                >
                  <stat.icon size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Recommendations from notification log */}
          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>

            {recommendations.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No notifications sent yet. Schemes will appear once your
                  representative dispatches them.
                </Text>
              </View>
            ) : (
              recommendations.map((reco, idx) => {
                const isApplied = appliedSchemeIds.has(reco.schemeId);
                return (
                  <View key={`reco_${idx}`} style={styles.schemeCard}>
                    <View style={styles.schemeContent}>
                      <Text style={styles.schemeName}>{reco.schemeName}</Text>
                      {reco.schemeDescription ? (
                        <Text style={styles.schemeDescription} numberOfLines={2}>
                          {reco.schemeDescription}
                        </Text>
                      ) : null}
                    </View>

                    <View style={styles.schemeActionRow}>
                      {isApplied ? (
                        <View style={styles.alreadyAppliedWrap}>
                          <Text style={styles.alreadyAppliedText}>Already Applied</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.schemeApplyButton}
                          activeOpacity={0.8}
                          onPress={() =>
                            handleOpenScheme({
                              title: reco.schemeName || reco.scheme_name,
                              desc: reco.schemeDescription || reco.description,
                              schemeId: reco.schemeId || reco.scheme_id,
                              eligibility: reco.eligibility,
                              benefit_type: reco.benefit_type,
                              deadline: reco.end_date,
                              target_occupation: reco.target_occupation,
                              target_interest: reco.target_interest,
                            })
                          }
                        >
                          <Text style={styles.schemeApplyButtonText}>
                            View & Apply
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
          )}
        </View>
      </ScrollView>
      </View>

      {/* Notifications Panel */}
      <Modal
        visible={isNotificationOpen}
        transparent
        animationType="none"
        onRequestClose={handleCloseNotifications}
      >
        <View style={styles.notificationRoot}>
          <Pressable
            style={styles.notificationBackdrop}
            onPress={handleCloseNotifications}
          />
          <Animated.View
            style={[
              styles.notificationPanel,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <TouchableOpacity
                style={styles.notificationCloseButton}
                onPress={handleCloseNotifications}
                activeOpacity={0.8}
              >
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.notificationContent}
              contentContainerStyle={styles.notificationContentInner}
              showsVerticalScrollIndicator={false}
            >
              {notificationItems.length === 0 ? (
                <Text style={styles.emptyText}>No notifications yet.</Text>
              ) : (
                notificationItems.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.notificationCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      handleCloseNotifications();
                      handleOpenScheme({
                        id: item.schemeId,
                        title: item.title,
                        schemeId: item.schemeId,
                      });
                    }}
                  >
                    <Text style={styles.notificationCardTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.notificationCardStatus}>
                      Date: {item.date}
                    </Text>
                    {item.benefit_type ? (
                      <Text style={styles.notificationCardBenefit}>
                        {item.benefit_type}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: theme.colors.primary },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 96, paddingHorizontal: theme.spacing.s },
  headerBar: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.l,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWelcome: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.colors.white,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  headerName: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    textAlign: 'center',
  },
  headerSideSpacer: { width: 44, height: 44 },
  bellContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '700' },
  body: {
    flex: 1,
    marginTop: -12,
    marginHorizontal: theme.spacing.s,
    marginBottom: theme.spacing.l,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  bodyScroll: {
    flex: 1,
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
    marginTop: theme.spacing.xs,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    minHeight: 110,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: '#E8EAF1',
    ...theme.shadows.card,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    ...theme.typography.subHeader,
    marginBottom: theme.spacing.m,
  },
  recommendationSection: {
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: theme.spacing.l,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
  },
  schemeCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#E6EBF7',
    width: '100%',
    alignSelf: 'stretch',
    ...theme.shadows.card,
    justifyContent: 'space-between',
  },
  schemeName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
    lineHeight: 26,
    textAlign: 'left',
  },
  schemeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  schemeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    textAlign: 'left',
  },
  schemeActionRow: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  schemeApplyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 3,
  },
  schemeApplyButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  schemeTopRow: { display: 'none' },
  badgeChip: { display: 'none' },
  badgeText: { display: 'none' },
  benefitBadge: { display: 'none' },
  benefitText: { display: 'none' },
  alreadyAppliedWrap: { width: '100%', paddingVertical: 10, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.badgeSuccessBg, borderWidth: 1, borderColor: '#BFE7CD', alignItems: 'center', justifyContent: 'center' },
  alreadyAppliedText: { color: theme.colors.success, fontWeight: '700' },
  schemeCardBottom: { display: 'none' },
  deadlineWrap: { display: 'none' },
  deadlineText: { display: 'none' },
  applyLink: { display: 'none' },
  applyLinkText: { display: 'none' },
  emptyState: { padding: theme.spacing.xxl, alignItems: 'center' },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  notificationRoot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notificationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  notificationPanel: {
    width: '83%',
    maxWidth: 360,
    height: '100%',
    backgroundColor: theme.colors.white,
    paddingTop: theme.spacing.xl,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F8',
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  notificationCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F5FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: { flex: 1 },
  notificationContentInner: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    paddingBottom: theme.spacing.xxl,
  },
  notificationCard: {
    backgroundColor: '#F7F9FF',
    borderWidth: 1,
    borderColor: '#E6EBF7',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    marginBottom: 10,
  },
  notificationCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  notificationCardStatus: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 5,
  },
  notificationCardBenefit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B9D5A',
  },
});

export default HomeScreen;
