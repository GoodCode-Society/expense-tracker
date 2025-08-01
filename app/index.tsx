import ExpenseCard from '@/components/ExpenseCard';
import { DashboardStats, Transaction } from '@/hooks/useDatabase';
import { useDatabaseService } from '@/hooks/useDatabaseService';
import { COLORS } from '@/utils/constants';
import { formatCurrency } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { databaseService, isLoading, error, isReady } = useDatabaseService();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!databaseService) {
      console.log('Database service not available');
      return;
    }

    console.log('Loading dashboard data...');
    try {
      console.log('Calling getDashboardStats...');
      const dashboardStats = await databaseService.getDashboardStats();
      console.log('Dashboard stats:', dashboardStats);

      console.log('Calling getTransactions...');
      const transactions = await databaseService.getTransactions();
      console.log('Transactions:', transactions);

      setStats(dashboardStats);
      setRecentTransactions(transactions.slice(0, 5));
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isReady) {
        loadDashboardData();
      }
    }, [isReady])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading database: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Overview */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={[
          styles.balanceAmount,
          { color: stats.balance >= 0 ? COLORS.success : COLORS.error }
        ]}>
          {formatCurrency(stats.balance)}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <ExpenseCard style={[styles.statCard, { backgroundColor: COLORS.success }]}>
          <View style={styles.statContent}>
            <Ionicons name="trending-up" size={24} color="#ffffff" />
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statAmount}>
              {formatCurrency(stats.totalIncome)}
            </Text>
          </View>
        </ExpenseCard>

        <ExpenseCard style={[styles.statCard, { backgroundColor: COLORS.error }]}>
          <View style={styles.statContent}>
            <Ionicons name="trending-down" size={24} color="#ffffff" />
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statAmount}>
              {formatCurrency(stats.totalExpense)}
            </Text>
          </View>
        </ExpenseCard>
      </View>

      {/* Recent Transactions */}
      <ExpenseCard style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionCategory}>
                  {transaction.category_name || 'Unknown'}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                {
                  color: transaction.type === 'income'
                    ? COLORS.success
                    : COLORS.error
                }
              ]}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No transactions yet</Text>
        )}
      </ExpenseCard>

      {/* Quick Stats */}
      <ExpenseCard style={styles.quickStats}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>{stats.totalTransactions}</Text>
            <Text style={styles.quickStatLabel}>Total Transactions</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatNumber}>
              {stats.totalExpense > 0
                ? Math.round((stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100)
                : 0}%
            </Text>
            <Text style={styles.quickStatLabel}>Expense Ratio</Text>
          </View>
        </View>
      </ExpenseCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  balanceSection: {
    backgroundColor: COLORS.primary,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  statAmount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentSection: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  quickStats: {
    padding: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});