import { Category, Transaction } from '@/hooks/useDatabase';
import { useDatabaseService } from '@/hooks/useDatabaseService';
import { COLORS, TRANSACTION_TYPES } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editingTransaction?: Transaction;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  editingTransaction,
}) => {
  const { databaseService, isReady } = useDatabaseService();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState(TRANSACTION_TYPES.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && isReady) {
      loadCategories();
      if (editingTransaction) {
        setAmount(editingTransaction.amount.toString());
        setType(editingTransaction.type);
        setCategoryId(editingTransaction.category_id?.toString() || '');
        setDescription(editingTransaction.description || '');
        setDate(editingTransaction.date);
      } else {
        resetForm();
      }
    }
  }, [visible, editingTransaction, isReady]);

  const loadCategories = async () => {
    if (!databaseService) return;
    
    try {
      const data = await databaseService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const resetForm = () => {
    setAmount('');
    setType(TRANSACTION_TYPES.EXPENSE);
    setCategoryId('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!amount || !categoryId || !databaseService) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        amount: parseFloat(amount),
        type: type as 'income' | 'expense',
        category_id: parseInt(categoryId),
        description,
        date,
      };

      if (editingTransaction) {
        await databaseService.updateTransaction(editingTransaction.id, transactionData);
      } else {
        await databaseService.addTransaction(transactionData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    }
    setLoading(false);
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.saveButton, loading && { opacity: 0.5 }]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type *</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === TRANSACTION_TYPES.EXPENSE && styles.selectedType,
                ]}
                onPress={() => setType(TRANSACTION_TYPES.EXPENSE)}
              >
                <Text style={[
                  styles.typeText,
                  type === TRANSACTION_TYPES.EXPENSE && styles.selectedTypeText,
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === TRANSACTION_TYPES.INCOME && styles.selectedType,
                ]}
                onPress={() => setType(TRANSACTION_TYPES.INCOME)}
              >
                <Text style={[
                  styles.typeText,
                  type === TRANSACTION_TYPES.INCOME && styles.selectedTypeText,
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={setCategoryId}
                style={styles.picker}
              >
                <Picker.Item label="Select a category" value="" />
                {filteredCategories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id.toString()}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  selectedType: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedTypeText: {
    color: '#ffffff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
  },
});

export default AddTransactionModal;