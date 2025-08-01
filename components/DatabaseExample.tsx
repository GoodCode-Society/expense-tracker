import { Transaction } from '@/hooks/useDatabase';
import { useDatabaseService } from '@/hooks/useDatabaseService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

export default function DatabaseExample() {
  const { databaseService, isLoading, error, isReady } = useDatabaseService();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isReady) {
      loadTransactions();
    }
  }, [isReady]);

  const loadTransactions = async () => {
    if (!databaseService) return;
    
    try {
      const data = await databaseService.getTransactions();
      setTransactions(data);
      console.log('Loaded transactions:', data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const addSampleTransaction = async () => {
    if (!databaseService) return;
    
    try {
      await databaseService.addTransaction({
        amount: 25.50,
        type: 'expense',
        category_id: 1,
        description: 'Sample transaction',
        date: new Date().toISOString().split('T')[0]
      });
      loadTransactions(); // Reload after adding
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading Database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Database Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Test</Text>
      <Text>Transactions: {transactions.length}</Text>
      <Button title="Add Sample Transaction" onPress={addSampleTransaction} />
      <Button title="Reload Transactions" onPress={loadTransactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
});