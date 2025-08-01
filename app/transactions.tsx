import AddTransactionModal from '@/components/AddTransactionModal';
import ExpenseCard from '@/components/ExpenseCard';
import FilterButtons from '@/components/FilterButtons';
import { Transaction } from '@/hooks/useDatabase';
import { useDatabaseService } from '@/hooks/useDatabaseService';
import { COLORS, FILTER_OPTIONS } from '@/utils/constants';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TransactionsScreen() {
  const { databaseService, isLoading, error, isReady } = useDatabaseService();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    if (!databaseService) return;
    
    try {
      const data = await databaseService.getTransactions();
      setTransactions(data);
      filterTransactions(data, selectedFilter);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filterTransactions = (data: Transaction[], filter: string) => {
    let filtered = data;
    if (filter !== 'All') {
      filtered = data.filter(
        (transaction) => transaction.type === filter.toLowerCase()
      );
    }
    setFilteredTransactions(filtered);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isReady) {
        loadTransactions();
      }
    }, [isReady])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    filterTransactions(transactions, filter);
  };

  const handleDelete = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!databaseService) return;
            try {
              await databaseService.deleteTransaction(transaction.id);
              loadTransactions();
            } catch (error) {
              console.error('Error deleting transaction:', error);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingTransaction(null);
    loadTransactions();
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

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <ExpenseCard style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionMain}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: item.color || COLORS.primary }
          ]}>
            <Ionicons 
              name="receipt-outline" 
              size={20} 
              color="#ffffff" 
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.categoryName}>
              {item.category_name || 'Unknown'}
            </Text>
            <Text style={styles.transactionDescription}>
              {item.description || 'No description'}
            </Text>
            <Text style={styles.transactionDate}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText,
              { color: item.type === 'income' ? COLORS.success : COLORS.error }
            ]}>
              {item.type === 'income' ? '+' : '-'}
              {formatCurrency(Math.abs(item.amount))}
            </Text>
          </View>
        </View>
        <View style={styles.transactionActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </ExpenseCard>
  );

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <FilterButtons
        options={FILTER_OPTIONS}
        selected={selectedFilter}
        onSelect={handleFilterChange}
      />

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <ExpenseCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions found</Text>
            <Text style={styles.emptySubText}>
              Tap the + button to add your first transaction
            </Text>
          </ExpenseCard>
        )}
      />

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={handleModalClose}
        editingTransaction={editingTransaction || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    marginBottom: 12,
    padding: 16,
  },
  transactionContent: {
    flexDirection: 'column',
  },
  transactionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
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