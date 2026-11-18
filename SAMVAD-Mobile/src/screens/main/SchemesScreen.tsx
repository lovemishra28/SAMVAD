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
import { Search } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import SegmentedTabContainer from '../../components/SegmentedTabContainer';
import HeaderContainer from '../../components/HeaderContainer';
import HeroContainer from '../../components/HeroContainer';
import { mobileApi } from '../../api/client';

const SchemesScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [allSchemes, setAllSchemes] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const [recoRes, schemesRes, appsRes] = await Promise.all([
            mobileApi.getMyRecommendations().catch(() => ({ schemes: [], found: false })),
            mobileApi.getSchemes().catch(() => ({ schemes: [] })),
            mobileApi.getApplications().catch(() => ({ applications: [] })),
          ]);
          setRecommendations(recoRes.schemes || []);
          setAllSchemes(schemesRes.schemes || []);
          setAllApplications(appsRes.applications || []);
        } catch {
          setRecommendations([]);
          setAllSchemes([]);
          setAllApplications([]);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const openSchemeDetails = (scheme: any) => {
    navigation.navigate('SchemeDetails', {
      scheme: {
        id: scheme.scheme_id || scheme.schemeId || '',
        title: scheme.scheme_name || scheme.schemeName || '',
        desc: scheme.description || '',
        schemeId: scheme.scheme_id || scheme.schemeId || '',
        deadline: scheme.end_date || '',
        eligibility: scheme.eligibility || '',
        benefit_type: scheme.benefit_type || '',
        target_occupation: scheme.target_occupation || '',
        target_interest: scheme.target_interest || '',
        isApplied: !!scheme.isApplied,
        appliedAt: scheme.appliedAt || '',
      },
    });
  };

  // Recommendation card (Home-style immersive look)
  const RecoCard = ({ reco, isApplied }: { reco: any; isApplied: boolean }) => (
    <View style={styles.schemeCard}>
      <Text style={styles.schemeName}>{reco.scheme_name || reco.schemeName}</Text>
      <Text style={styles.schemeDescription} numberOfLines={2}>
        {reco.description || reco.schemeDescription || 'Tap below to view and apply for this scheme.'}
      </Text>
      {isApplied ? (
        <View style={styles.alreadyAppliedBadge}>
          <Text style={styles.alreadyAppliedBadgeText}>Already Applied</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.schemeApplyButton}
          activeOpacity={0.8}
          onPress={() => openSchemeDetails(reco)}
        >
          <Text style={styles.schemeApplyButtonText}>View Details & Apply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Full scheme card (Home-style)
  const SchemeCard = ({ scheme }: { scheme: any }) => {
    const isApplied = !!(scheme.isApplied || scheme.status === 'applied');

    return (
      <View style={styles.schemeCard}>
        <Text style={styles.schemeName}>{scheme.scheme_name}</Text>
        <Text style={styles.schemeDescription}>{scheme.description || 'Tap to see details and apply.'}</Text>

        {isApplied && (
          <View style={styles.alreadyAppliedBadge}>
            <Text style={styles.alreadyAppliedBadgeText}>Already Applied</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.schemeApplyButton,
            isApplied && styles.schemeApplyButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={() => openSchemeDetails(scheme)}
          disabled={isApplied}
        >
          <Text style={styles.schemeApplyButtonText}>
            {isApplied ? 'Already Applied' : 'View Details & Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Filter applied schemes to pass to RecoCard
  const appliedSchemeIds = new Set(allApplications.map(a => a.schemeId));

  // Filter logic
  const filterBySearch = (items: any[], nameKey: string) =>
    items.filter(item =>
      (item[nameKey] || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const filteredRecommendations = filterBySearch(recommendations, 'schemeName');
  const filteredSchemes = filterBySearch(allSchemes, 'scheme_name');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      <HeaderContainer title="Schemes" />

      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <HeroContainer>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Schemes"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
            <Search size={17} color={theme.colors.textPrimary} strokeWidth={2.1} />
          </TouchableOpacity>
        </View>

        <SegmentedTabContainer
          tabs={['Recommended', 'All Schemes']}
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
          ) : activeTab === 'Recommended' ? (
            filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((reco, idx) => (
                <RecoCard 
                  key={`reco_${idx}`} 
                  reco={reco} 
                  isApplied={appliedSchemeIds.has(reco.schemeId || reco.scheme_id)}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? 'No recommendations match your search.'
                    : 'No notifications sent yet. Schemes will appear once dispatched by your representative.'}
                </Text>
              </View>
            )
          ) : filteredSchemes.length > 0 ? (
            filteredSchemes.map(scheme => <SchemeCard key={scheme._id || scheme.scheme_id} scheme={scheme} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No schemes match your search.' : 'No schemes available right now.'}
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
  heroScroll: { flex: 1 },
  heroScrollContent: { paddingBottom: theme.spacing.xxl, paddingHorizontal: theme.spacing.m },
  bodyContainer: { flex: 1, marginTop: theme.spacing.s, marginHorizontal: theme.spacing.s, marginBottom: theme.spacing.l },
  body: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, backgroundColor: theme.colors.background, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#B7DBE8', borderRadius: 28, paddingLeft: 16, paddingRight: 16, minHeight: 56, marginBottom: theme.spacing.m, marginHorizontal: theme.spacing.s, },
  searchInput: { flex: 1, height: 40, fontSize: 15, lineHeight: 20, color: theme.colors.textPrimary, fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
  searchButton: { width: 38, height: 38, borderRadius: theme.borderRadius.md, borderWidth: 2, borderColor: theme.colors.textPrimary, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B7DBE8' },
  schemeCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.m, marginBottom: theme.spacing.s, ...theme.shadows.card, justifyContent: 'space-between' },
  schemeName: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  schemeDescription: { fontSize: 15, color: theme.colors.textSecondary, marginBottom: theme.spacing.s },
  schemeApplyButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, height: 44, justifyContent: 'center', alignItems: 'center', marginTop: theme.spacing.s },
  schemeApplyButtonDisabled: { backgroundColor: '#A4CFDF' },
  schemeApplyButtonText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  alreadyAppliedBadge: { marginTop: theme.spacing.s, paddingVertical: 4, paddingHorizontal: 10, borderRadius: theme.borderRadius.full, backgroundColor: '#D9F5E4', alignSelf: 'flex-start' },
  alreadyAppliedBadgeText: { color: theme.colors.success, fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.m, marginBottom: theme.spacing.m, ...theme.shadows.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  cardTitle: { ...theme.typography.subHeader, marginBottom: theme.spacing.xs, flex: 1 },
  cardDesc: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.m },
  matchBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9F8EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, gap: 4 },
  matchText: { fontSize: 13, fontWeight: '700', color: '#2B9D5A' },
  chipsRow: { flexDirection: 'row', gap: 10, marginBottom: theme.spacing.m },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: theme.borderRadius.full, gap: 4 },
  chipText: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary },
  appliedChip: { backgroundColor: theme.colors.badgeSuccessBg, borderWidth: 1, borderColor: '#BFE7CD' },
  appliedChipText: { fontSize: 12, fontWeight: '700', color: theme.colors.success },
  deadlineChip: { backgroundColor: '#FFF6EA', borderWidth: 1, borderColor: '#FFE1B3' },
  deadlineLabel: { fontSize: 11, fontWeight: '700', color: '#A56500', textTransform: 'uppercase', letterSpacing: 0.3 },
  deadlineValue: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary },
  applyRow: { alignItems: 'flex-end' },
  applyLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  applyText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary },
  emptyState: { padding: theme.spacing.xxl, alignItems: 'center' },
  emptyText: { color: theme.colors.textSecondary, fontSize: 15, textAlign: 'center' },
});

export default SchemesScreen;
