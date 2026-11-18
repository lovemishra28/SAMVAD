import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import {
  User,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  CreditCard,
  Edit3,
  HelpCircle,
  LogOut,
  ChevronRight,
  MessageCircle,
  X,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { authApi, clearAuth, getCachedUser, saveUserProfile } from '../../api/client';

const ALL_INTERESTS = [
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'arts', label: 'Arts' },
  { id: 'community', label: 'Community' },
  { id: 'education', label: 'Education' },
  { id: 'environment', label: 'Environment' },
  { id: 'finance', label: 'Finance' },
  { id: 'health', label: 'Health' },
  { id: 'sports', label: 'Sports' },
  { id: 'technology', label: 'Technology' },
  { id: 'welfare', label: 'Welfare' },
];

const INCOME_OPTIONS = [
  { id: 'below_1_5', label: 'Below ₹1,50,000' },
  { id: '1_5_to_3', label: '₹1,50,001 – ₹3,00,000' },
  { id: '3_to_6', label: '₹3,00,001 – ₹6,00,000' },
  { id: '6_to_10', label: '₹6,00,001 – ₹10,00,000' },
  { id: 'above_10', label: 'Above ₹10,00,000' },
];

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [isEditingEligibility, setIsEditingEligibility] = useState(false);
  const [editIncomeRange, setEditIncomeRange] = useState<string>('');
  const [editPwdStatus, setEditPwdStatus] = useState<boolean>(false);
  const [editBplStatus, setEditBplStatus] = useState<boolean>(false);
  const [editScstStatus, setEditScstStatus] = useState<boolean>(false);
  const [savingEligibility, setSavingEligibility] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const res = await authApi.getMe().catch(() => null);
          if (res?.user) {
            setUser(res.user);
          } else {
            const cached = await getCachedUser();
            if (cached) setUser(cached);
          }
        } catch {
          const cached = await getCachedUser();
          if (cached) setUser(cached);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          navigation.navigate('Starter');
        },
      },
    ]);
  };

  const openEditInterests = () => {
    setEditInterests(user?.interests || []);
    setIsEditingInterests(true);
  };

  const toggleEditInterest = (id: string) => {
    setEditInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const openEditEligibility = () => {
    setEditIncomeRange(user?.incomeRange || '');
    setEditPwdStatus(user?.pwdStatus || false);
    setEditBplStatus(user?.bplStatus || false);
    setEditScstStatus(user?.scstStatus || false);
    setIsEditingEligibility(true);
  };

  const saveEligibility = async () => {
    setSavingEligibility(true);
    try {
      const res = await authApi.updateProfile({
        incomeRange: editIncomeRange,
        pwdStatus: editPwdStatus,
        bplStatus: editBplStatus,
        scstStatus: editScstStatus,
      });
      setUser(res.user);
      await saveUserProfile(res.user);
      setIsEditingEligibility(false);
      Alert.alert('Saved', 'Your eligibility details have been updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update eligibility details.');
    } finally {
      setSavingEligibility(false);
    }
  };

  const saveInterests = async () => {
    if (editInterests.length === 0) {
      Alert.alert('Required', 'Please select at least one interest.');
      return;
    }

    setSavingInterests(true);
    try {
      const res = await authApi.updateProfile({ interests: editInterests });
      setUser(res.user);
      await saveUserProfile(res.user);
      setIsEditingInterests(false);
      Alert.alert('Saved', 'Your interests have been updated. You may receive new scheme recommendations based on your updated interests.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update interests.');
    } finally {
      setSavingInterests(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const profileInfo = [
    { icon: Briefcase, label: 'Category', value: user?.occupation || 'Not set' },
    { icon: MapPin, label: 'Area Type', value: user?.area_type || 'Not set' },
    { icon: Building2, label: 'City', value: user?.city || 'Not set' },
    { icon: CreditCard, label: 'Booth', value: user?.boothId || 'Not set' },
    { icon: Phone, label: 'Phone', value: `+91 ${user?.mobileNumber || ''}` },
  ];

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconCircle}>
          <Icon size={16} color={theme.colors.primary} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const ActionButton = ({ icon: Icon, label, color, onPress }: any) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Icon size={18} color={color} />
        <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      </View>
      <ChevronRight size={16} color={color} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <User size={40} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.phone}>+91 {user?.mobileNumber || ''}</Text>
        {user?.boothId && (
          <Text style={styles.booth}>Booth {user.boothId}{user?.city ? ` • ${user.city}` : ''}</Text>
        )}
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.body}>
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyScrollContent} showsVerticalScrollIndicator={false}>

            {/* INFO CARD */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Your Details</Text>
              {profileInfo.map((item, index) => (
                <React.Fragment key={item.label}>
                  <InfoRow icon={item.icon} label={item.label} value={item.value} />
                  {index < profileInfo.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>

        {/* Interests Card — with edit button */}
        <View style={styles.card}>
          <View style={styles.interestHeaderRow}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <TouchableOpacity
              style={styles.editInterestButton}
              activeOpacity={0.7}
              onPress={openEditInterests}
            >
              <Edit3 size={14} color={theme.colors.primary} />
              <Text style={styles.editInterestText}>Edit</Text>
            </TouchableOpacity>
          </View>
          {user?.interests && user.interests.length > 0 ? (
            <View style={styles.interestsRow}>
              {user.interests.map((interest: string) => (
                <View key={interest} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noInterestsText}>No interests set. Tap Edit to add some.</Text>
          )}
        </View>

        {/* Eligibility Details Card — with edit button */}
        <View style={styles.card}>
          <View style={styles.interestHeaderRow}>
            <Text style={styles.sectionTitle}>Eligibility Details</Text>
            <TouchableOpacity
              style={styles.editInterestButton}
              activeOpacity={0.7}
              onPress={openEditEligibility}
            >
              <Edit3 size={14} color={theme.colors.primary} />
              <Text style={styles.editInterestText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.eligibilityContent}>
            {user?.incomeRange ? (
              <View style={styles.eligibilityRow}>
                <Text style={styles.eligibilityLabel}>Annual Income:</Text>
                <Text style={styles.eligibilityValue}>
                  {INCOME_OPTIONS.find(o => o.id === user.incomeRange)?.label || user.incomeRange}
                </Text>
              </View>
            ) : (
              <Text style={styles.noEligibilityText}>Income information not set</Text>
            )}
            <View style={styles.eligibilityStatusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>PwD Certificate</Text>
                <Text style={[styles.statusValue, user?.pwdStatus && styles.statusYes]}>
                  {user?.pwdStatus ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>BPL Card</Text>
                <Text style={[styles.statusValue, user?.bplStatus && styles.statusYes]}>
                  {user?.bplStatus ? 'Yes' : 'No'}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>SC/ST</Text>
                <Text style={[styles.statusValue, user?.scstStatus && styles.statusYes]}>
                  {user?.scstStatus ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* FEEDBACK CARD */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Feedback')}>
          <Text style={styles.cardTitle}>Give Feedback</Text>
          <Text style={styles.cardDesc}>
            Share your experience with schemes and help improve services
          </Text>

          <View style={styles.applyRow}>
            <View style={styles.applyLink}>
              <MessageCircle size={14} color={theme.colors.primary} />
              <Text style={styles.applyText}>Send Feedback</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ACTIONS */}
        <View style={styles.card}>
          <ActionButton
            icon={HelpCircle}
            label="Contact Us"
            color={theme.colors.primary}
            onPress={() => navigation.navigate('ContactUs')}
          />
          <View style={styles.divider} />
          <ActionButton
            icon={LogOut}
            label="Log Out"
            color={theme.colors.error}
            onPress={handleLogout}
          />
        </View>

          </ScrollView>
        </View>
      </View>

      {/* Edit Interests Modal */}
      <Modal
        visible={isEditingInterests}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingInterests(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Interests</Text>
              <TouchableOpacity onPress={() => setIsEditingInterests(false)} style={styles.modalClose}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Select the types of schemes you're interested in. This will refine your recommendations.
            </Text>

            <View style={styles.modalGrid}>
              {ALL_INTERESTS.map(interest => {
                const isSelected = editInterests.includes(interest.id);
                return (
                  <TouchableOpacity
                    key={interest.id}
                    style={[styles.modalChip, isSelected && styles.modalChipSelected]}
                    onPress={() => toggleEditInterest(interest.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalChipText, isSelected && styles.modalChipTextSelected]}>
                      {interest.label}
                    </Text>
                    {isSelected && <Text style={styles.modalCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.modalSaveButton, savingInterests && { opacity: 0.7 }]}
              onPress={saveInterests}
              disabled={savingInterests}
              activeOpacity={0.85}
            >
              {savingInterests ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.modalSaveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Eligibility Modal */}
      <Modal
        visible={isEditingEligibility}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingEligibility(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.eligibilityModalCard]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Eligibility Details</Text>
              <TouchableOpacity onPress={() => setIsEditingEligibility(false)} style={styles.modalClose}>
                <X size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.eligibilityModalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Update your eligibility information to find relevant schemes.
              </Text>

              {/* Income Range */}
              <View style={styles.eligibilityFormGroup}>
                <Text style={styles.eligibilityFormLabel}>Annual Household Income</Text>
                <View style={styles.incomeOptionsGrid}>
                  {INCOME_OPTIONS.map(option => {
                    const isSelected = editIncomeRange === option.id;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.incomeOption, isSelected && styles.incomeOptionSelected]}
                        onPress={() => setEditIncomeRange(option.id)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.incomeOptionText, isSelected && styles.incomeOptionTextSelected]}>
                          {option.label}
                        </Text>
                        {isSelected && <Text style={styles.incomeCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* PWD Status Toggle */}
              <View style={styles.toggleFormGroup}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleLabelCol}>
                    <Text style={styles.toggleLabel}>Disability Certificate (PwD)</Text>
                    <Text style={styles.toggleDesc}>Do you have a disability certificate?</Text>
                  </View>
                  <Switch
                    value={editPwdStatus}
                    onValueChange={setEditPwdStatus}
                    trackColor={{ false: '#E0E0E0', true: `${theme.colors.primary}40` }}
                    thumbColor={editPwdStatus ? theme.colors.primary : '#F0F0F0'}
                  />
                </View>
              </View>

              {/* BPL Status Toggle */}
              <View style={styles.toggleFormGroup}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleLabelCol}>
                    <Text style={styles.toggleLabel}>BPL Card</Text>
                    <Text style={styles.toggleDesc}>Does your family hold a BPL card?</Text>
                  </View>
                  <Switch
                    value={editBplStatus}
                    onValueChange={setEditBplStatus}
                    trackColor={{ false: '#E0E0E0', true: `${theme.colors.primary}40` }}
                    thumbColor={editBplStatus ? theme.colors.primary : '#F0F0F0'}
                  />
                </View>
              </View>

              {/* SCST Status Toggle */}
              <View style={styles.toggleFormGroup}>
                <View style={styles.toggleLabelRow}>
                  <View style={styles.toggleLabelCol}>
                    <Text style={styles.toggleLabel}>SC/ST Category</Text>
                    <Text style={styles.toggleDesc}>Do you belong to SC/ST category?</Text>
                  </View>
                  <Switch
                    value={editScstStatus}
                    onValueChange={setEditScstStatus}
                    trackColor={{ false: '#E0E0E0', true: `${theme.colors.primary}40` }}
                    thumbColor={editScstStatus ? theme.colors.primary : '#F0F0F0'}
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSaveButton, savingEligibility && { opacity: 0.7 }]}
              onPress={saveEligibility}
              disabled={savingEligibility}
              activeOpacity={0.85}
            >
              {savingEligibility ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <Text style={styles.modalSaveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  header: { backgroundColor: theme.colors.primary, alignItems: 'center', paddingTop: theme.spacing.l, paddingBottom: theme.spacing.s, marginTop: theme.spacing.s },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.m },
  name: { fontSize: 22, fontWeight: '700', color: theme.colors.white },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  booth: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: '600' },
  bodyContainer: {
    flex: 1,
    marginTop: theme.spacing.s,
    marginHorizontal: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  body: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bodyScroll: { flex: 1 },
  bodyScrollContent: { padding: theme.spacing.m, paddingBottom: theme.spacing.xxl },
  card: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.m, marginBottom: theme.spacing.m, ...theme.shadows.card },
  sectionTitle: { ...theme.typography.subHeader, marginBottom: theme.spacing.m },
  cardTitle: { ...theme.typography.subHeader, marginBottom: theme.spacing.xs },
  cardDesc: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: theme.spacing.m },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.s },
  infoLeft: { flexDirection: 'row', alignItems: 'center' },
  infoIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.m },
  infoLabel: { ...theme.typography.label },
  infoValue: { ...theme.typography.body, fontWeight: '600' },
  divider: { height: 1, backgroundColor: theme.colors.border },
  interestHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m },
  editInterestButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${theme.colors.primary}12`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full },
  editInterestText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: { backgroundColor: `${theme.colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full },
  interestChipText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary, textTransform: 'capitalize' },
  noInterestsText: { fontSize: 14, color: theme.colors.textSecondary, fontStyle: 'italic' },
  actionButton: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.m },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionLabel: { fontSize: 15, fontWeight: '600' },
  applyRow: { alignItems: 'flex-end' },
  applyLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  applyText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(18, 27, 52, 0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.m },
  modalCard: { width: '100%', maxWidth: 400, backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: theme.spacing.m, ...theme.shadows.card },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary },
  modalClose: { width: 34, height: 34, borderRadius: theme.borderRadius.full, backgroundColor: '#F2F5FB', alignItems: 'center', justifyContent: 'center' },
  modalSubtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.m, lineHeight: 20 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.s, marginBottom: theme.spacing.m },
  modalChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: theme.borderRadius.md, borderWidth: 1.5, borderColor: '#CBD8F1', backgroundColor: '#F4F7FF', position: 'relative' },
  modalChipSelected: { borderColor: theme.colors.primary, backgroundColor: '#E3EEF9' },
  modalChipText: { fontSize: 14, fontWeight: '600', color: '#5A6280' },
  modalChipTextSelected: { color: theme.colors.primary },
  modalCheck: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.primary, color: theme.colors.white, textAlign: 'center', lineHeight: 18, fontSize: 11, fontWeight: '700', overflow: 'hidden' },
  modalSaveButton: { backgroundColor: theme.colors.primary, height: 50, borderRadius: theme.borderRadius.md, justifyContent: 'center', alignItems: 'center' },
  modalSaveText: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  // Eligibility Details Card
  eligibilityContent: { gap: theme.spacing.m },
  eligibilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eligibilityLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  eligibilityValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
  noEligibilityText: { fontSize: 14, color: theme.colors.textSecondary, fontStyle: 'italic' },
  eligibilityStatusRow: { flexDirection: 'row', justifyContent: 'space-around', gap: theme.spacing.s, marginTop: theme.spacing.s, paddingTop: theme.spacing.s, borderTopWidth: 1, borderTopColor: theme.colors.border },
  statusItem: { alignItems: 'center', flex: 1 },
  statusLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  statusValue: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  statusYes: { color: '#27AE60' },
  // Eligibility Modal
  eligibilityModalCard: { maxHeight: '85%' },
  eligibilityModalScroll: { maxHeight: 340, marginBottom: theme.spacing.m },
  eligibilityFormGroup: { marginBottom: theme.spacing.l },
  eligibilityFormLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: theme.spacing.s },
  incomeOptionsGrid: { gap: theme.spacing.s },
  incomeOption: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: theme.borderRadius.md, borderWidth: 1.5, borderColor: '#CBD8F1', backgroundColor: '#F4F7FF', position: 'relative', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incomeOptionSelected: { borderColor: theme.colors.primary, backgroundColor: '#E3EEF9' },
  incomeOptionText: { fontSize: 14, fontWeight: '600', color: '#5A6280', flex: 1 },
  incomeOptionTextSelected: { color: theme.colors.primary, fontWeight: '700' },
  incomeCheck: { width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.primary, color: theme.colors.white, textAlign: 'center', fontSize: 11, fontWeight: '700', lineHeight: 18 },
  toggleFormGroup: { marginBottom: theme.spacing.l, paddingBottom: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  toggleLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabelCol: { flex: 1, marginRight: theme.spacing.m },
  toggleLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  toggleDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
});

export default ProfileScreen;