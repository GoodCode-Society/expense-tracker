import ExpenseCard from '@/components/ExpenseCard';
import { addTransaction, getCategories, getTransactions } from '@/database/database';
import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import XLSX from 'xlsx';

export default function ImportScreen() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImporting(true);
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name || '';
        const isExcel = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');
        const isCSV = fileName.toLowerCase().endsWith('.csv');
        
        // Check if file type is supported
        if (!isExcel && !isCSV) {
          Alert.alert('Unsupported File', 'Please select a CSV (.csv) or Excel (.xlsx, .xls) file.');
          setImporting(false);
          return;
        }
        
        let lines: string[] = [];
        
        if (isExcel) {
          // Read Excel file
          const fileData = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Parse Excel file
          const workbook = XLSX.read(fileData, { type: 'base64' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to CSV format
          const csvData = XLSX.utils.sheet_to_csv(worksheet);
          lines = csvData.split('\n');
        } else {
          // Read the CSV file
          const csvContent = await FileSystem.readAsStringAsync(fileUri);
          lines = csvContent.split('\n');
        }
        
        if (lines.length < 2) {
          Alert.alert('Error', 'CSV file appears to be empty or invalid');
          setImporting(false);
          return;
        }

        // Get categories for mapping
        const categories = await getCategories();
        const categoryMap = new Map();
        categories.forEach(cat => {
          categoryMap.set(cat.name.toLowerCase(), cat.id);
        });

        // Skip header row and process data
        let importedCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          try {
            // Parse CSV line (handle quoted values)
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanValues = values.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));

            if (cleanValues.length < 4) continue;

            const [date, amount, type, category, description = ''] = cleanValues;

            // Validate data
            if (!date || !amount || !type || !category) {
              errorCount++;
              continue;
            }

            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount)) {
              errorCount++;
              continue;
            }

            const normalizedType = type.toLowerCase();
            if (normalizedType !== 'income' && normalizedType !== 'expense') {
              errorCount++;
              continue;
            }

            // Find category ID
            let categoryId = categoryMap.get(category.toLowerCase());
            if (!categoryId) {
              // Create new category if it doesn't exist
              const newCategory = {
                name: category,
                type: normalizedType,
                icon: normalizedType === 'income' ? 'trending-up' : 'remove-circle',
                color: normalizedType === 'income' ? '#4CAF50' : '#F44336'
              };
              // For now, use a default category ID (you might want to add a createCategory function)
              categoryId = 1; // Default to first category
            }

            // Add transaction
            await addTransaction({
              amount: parsedAmount,
              type: normalizedType,
              categoryId: categoryId,
              description: description,
              date: date
            });

            importedCount++;
          } catch (error) {
            console.error('Error processing line:', line, error);
            errorCount++;
          }
        }

        setImporting(false);
        
        if (importedCount > 0) {
          Alert.alert(
            'Import Complete', 
            `Successfully imported ${importedCount} transactions.${errorCount > 0 ? ` ${errorCount} rows had errors and were skipped.` : ''}`
          );
        } else {
          Alert.alert('Import Failed', 'No valid transactions found in the CSV file.');
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      Alert.alert('Error', 'Failed to import CSV file');
      setImporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      // Get all transactions from database
      const transactions = await getTransactions();
      
      if (transactions.length === 0) {
        Alert.alert('No Data', 'No transactions found to export');
        setExporting(false);
        return;
      }

      // Create CSV header
      const csvHeader = 'Date,Amount,Type,Category,Description\n';
      
      // Convert transactions to CSV format
      const csvData = transactions.map(transaction => {
        const date = transaction.date;
        const amount = transaction.amount;
        const type = transaction.type;
        const category = transaction.category_name || 'Uncategorized';
        const description = (transaction.description || '').replace(/"/g, '""'); // Escape quotes
        
        return `"${date}","${amount}","${type}","${category}","${description}"`;
      }).join('\n');

      const csvContent = csvHeader + csvData;

      // Create file path
      const fileName = `expense_tracker_export_${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // Write CSV to file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Transactions',
        });
        Alert.alert('Success', `Exported ${transactions.length} transactions`);
      } else {
        Alert.alert('Success', `Data exported to ${fileName}`);
      }
      
      setExporting(false);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export data');
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ExpenseCard style={styles.card}>
        <Text style={styles.cardTitle}>Import Data</Text>
        <Text style={styles.cardDescription}>
          Import your transaction data from CSV or Excel files
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleImportFile}
          disabled={importing}
        >
          <Ionicons name="cloud-upload" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>
            {importing ? 'Importing...' : 'Import CSV/Excel'}
          </Text>
        </TouchableOpacity>
      </ExpenseCard>

      <ExpenseCard style={styles.card}>
        <Text style={styles.cardTitle}>Export Data</Text>
        <Text style={styles.cardDescription}>
          Export your transaction data to CSV file
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: COLORS.success }]}
          onPress={handleExportCSV}
          disabled={exporting}
        >
          <Ionicons name="cloud-download" size={20} color="#ffffff" />
          <Text style={styles.buttonText}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Text>
        </TouchableOpacity>
      </ExpenseCard>

      <ExpenseCard style={styles.card}>
        <Text style={styles.cardTitle}>File Format</Text>
        <Text style={styles.cardDescription}>
          Your CSV or Excel file should have the following columns:
        </Text>
        <View style={styles.formatList}>
          <Text style={styles.formatItem}>• Date (YYYY-MM-DD)</Text>
          <Text style={styles.formatItem}>• Amount (number)</Text>
          <Text style={styles.formatItem}>• Type (income/expense)</Text>
          <Text style={styles.formatItem}>• Category (text)</Text>
          <Text style={styles.formatItem}>• Description (text)</Text>
        </View>
        <Text style={[styles.cardDescription, { marginTop: 12, fontSize: 12 }]}>
          Note: Both Excel files (.xlsx, .xls) and CSV files are fully supported.
        </Text>
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
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  formatList: {
    marginTop: 8,
  },
  formatItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
});