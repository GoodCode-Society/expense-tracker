import ExpenseCard from '@/components/ExpenseCard';
import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your transactions and categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement clear data logic
            Alert.alert('Success', 'All data has been cleared');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    danger = false 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={danger ? COLORS.error : COLORS.primary} 
        />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && { color: COLORS.error }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <ExpenseCard style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem
          icon="person-outline"
          title="Profile"
          subtitle="Update your profile information"
          onPress={() => Alert.alert('Coming Soon', 'Profile settings will be available soon')}
        />
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage notification preferences"
          onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
        />
        <SettingItem
          icon="shield-outline"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon')}
        />
      </ExpenseCard>

      <ExpenseCard style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <SettingItem
          icon="cloud-outline"
          title="Backup & Sync"
          subtitle="Backup your data to cloud"
          onPress={() => Alert.alert('Coming Soon', 'Backup feature will be available soon')}
        />
        <SettingItem
          icon="trash-outline"
          title="Clear All Data"
          subtitle="Permanently delete all data"
          onPress={handleClearData}
          danger={true}
        />
      </ExpenseCard>

      <ExpenseCard style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <SettingItem
          icon="information-circle-outline"
          title="App Version"
          subtitle="1.0.0"
          onPress={() => {}}
        />
        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help with the app"
          onPress={() => Alert.alert('Help', 'Contact support at help@expensetracker.com')}
        />
        <SettingItem
          icon="document-text-outline"
          title="Terms & Privacy"
          subtitle="Read our terms and privacy policy"
          onPress={() => Alert.alert('Coming Soon', 'Terms and privacy policy will be available soon')}
        />
      </ExpenseCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.surface,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});