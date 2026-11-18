import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import SegmentedTabContainer from '../../components/SegmentedTabContainer';
import HeaderContainer from '../../components/HeaderContainer';
import HeroContainer from '../../components/HeroContainer';
import { mobileApi } from '../../api/client';

const ApplicationsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Applied');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const [appRes, schRes] = await Promise.all([
            mobileApi.getApplications().catch(() => ({ applications: [] })),
            mobileApi.getSchemes().catch(() => ({ schemes: [] })),
          ]);
          setApplications(appRes.applications || []);
          setSchemes(schRes.schemes || []);
        } catch {
          // fallback
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  // Get scheme IDs that user already applied for
  const appliedSchemeIds = new Set(applications.map(a => a.schemeId));

  // Available = schemes user hasn't applied for yet
  const availableSchemes = schemes
    .filter(s => !s.isApplied && !appliedSchemeIds.has(s.scheme_id))
    .map(s => ({
      _id: s._id || s.scheme_id,
      schemeId: s.scheme_id,
      title: s.scheme_name && s.scheme_name.trim() ? s.scheme_name : 'Unknown Scheme',
      description: s.description || 'No description available',
      benefit_type: s.benefit_type || 'Not specified',
      deadline: s.end_date || 'No deadline',
      eligibility: s.eligibility || '',
      status: 'available',
    }));

  const appliedItems = applications.map(a => ({
    _id: a._id,
    schemeId: a.schemeId,
    title: a.schemeName && a.schemeName.trim() ? a.schemeName : (a.schemeDetails?.scheme_name || 'Unknown Scheme'),
    description: a.schemeDetails?.description || 'No description available',
    benefit_type: a.schemeDetails?.benefit_type || 'Not specified',
    deadline: a.schemeDetails?.end_date || 'No deadline',
    date: a.appliedAt ? new Date(a.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
    status: a.status || 'pending',
  }));

  const data = activeTab === 'Applied' ? appliedItems : availableSchemes;
  const filtered = data.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openSchemeDetails = (item: any) => {
    // Validate item before navigation
    if (!item || !item.schemeId) {
      console.warn('[ApplicationsScreen] Invalid item passed to openSchemeDetails', item);
      return;
    }
    
    navigation.navigate('SchemeDetails', {
      scheme: {
        id: item.schemeId || undefined,
        title: item.title || 'Scheme Details',
        desc: item.description || '',
        schemeId: item.schemeId,
        deadline: item.deadline || undefined,
        eligibility: item.eligibility || '',
        benefit_type: item.benefit_type || '',
      },
    });
  };

  const ApplicationCard = ({ item }: { item: any }) => {
    const isApplied = activeTab === 'Applied';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => openSchemeDetails(item)}>
        <View style={styles.cardTop}>
          <View
            style={[styles.tag, {
              backgroundColor: isApplied ? theme.colors.badgeSuccessBg : '#E6F6FB',
            }]}
          >
            <Text style={[styles.tagText, {
              color: isApplied ? theme.colors.success : theme.colors.primary,
            }]}>
              {isApplied ? (item.status === 'applied' ? 'Applied' : item.status) : 'Available'}
            </Text>
          </View>
          <ChevronRight size={18} color={theme.colors.textSecondary} />
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}

        <View style={styles.chipsRow}>
          {item.benefit_type ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.benefit_type}</Text>
            </View>
          ) : null}
          {item.deadline ? (
            <View style={[styles.chip, styles.deadlineChip]}>
              <Text style={styles.deadlineLabel}>Deadline</Text>
              <Text style={styles.deadlineValue}>{item.deadline}</Text>
            </View>
          ) : null}
        </View>

        {isApplied && item.date ? (
          <Text style={styles.dateText}>Applied on: {item.date}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      <HeaderContainer title="Applications" />

      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <HeroContainer>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Applications"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
            <Search size={17} color={theme.colors.textPrimary} strokeWidth={2.1} />
          </TouchableOpacity>
        </View>

        <SegmentedTabContainer
          tabs={['Applied', 'Available']}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <ScrollView
          style={styles.heroScroll}
          contentContainerStyle={styles.heroScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : filtered.length > 0 ? (
            filtered.map(item => <ApplicationCard key={item._id} item={item} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No applications match your search.' : 'No applications yet.'}
              </Text>
            </View>
          )}
        </ScrollView>
      </HeroContainer>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  bodyContainer: { flex: 1, marginTop: theme.spacing.s, marginHorizontal: theme.spacing.s, marginBottom: theme.spacing.l },
  body: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, backgroundColor: theme.colors.background, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  heroScroll: { flex: 1 },
  heroScrollContent: { paddingBottom: theme.spacing.xxl, paddingHorizontal: theme.spacing.m },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#B7DBE8', borderRadius: 28, paddingLeft: 16, paddingRight: 16, minHeight: 56, marginBottom: theme.spacing.m, marginHorizontal: theme.spacing.s, },
  searchInput: { flex: 1, height: 40, fontSize: 15, color: theme.colors.textPrimary, fontWeight: '500' },
  searchButton: { width: 38, height: 38, borderRadius: theme.borderRadius.md, borderWidth: 2, borderColor: theme.colors.textPrimary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B7DBE8' },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.m, marginBottom: theme.spacing.m, ...theme.shadows.card },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full },
  tagText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { ...theme.typography.subHeader, marginTop: theme.spacing.s, marginBottom: theme.spacing.xs },
  cardDesc: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.m },
  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: theme.spacing.s },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.borderRadius.full, gap: 4 },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary },
  deadlineChip: { backgroundColor: '#FFF6EA', borderWidth: 1, borderColor: '#FFE1B3' },
  deadlineLabel: { fontSize: 11, fontWeight: '700', color: '#A56500', textTransform: 'uppercase' },
  deadlineValue: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary },
  dateText: { ...theme.typography.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  emptyState: { padding: theme.spacing.xxl, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center' },
});

export default ApplicationsScreen;