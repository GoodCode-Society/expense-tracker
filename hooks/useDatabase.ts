import * as SQLite from 'expo-sqlite';
import { useEffect, useState } from 'react';

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  description: string;
  date: string;
  created_at: string;
  category_name?: string;
  icon?: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  totalTransactions: number;
  balance: number;
}

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function setupDatabase() {
      try {
        console.log('Opening database...');
        const database = await SQLite.openDatabaseAsync('expense_tracker.db');
        console.log('Database opened successfully');
        
        if (isMounted) {
          setDb(database);
          
          // Initialize tables if they don't exist
          console.log('Creating tables...');
          await database.execAsync(`
            PRAGMA journal_mode = WAL;
            
            CREATE TABLE IF NOT EXISTS categories (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              type TEXT NOT NULL,
              icon TEXT,
              color TEXT
            );

            CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              amount REAL NOT NULL,
              type TEXT NOT NULL,
              category_id INTEGER,
              description TEXT,
              date TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (category_id) REFERENCES categories (id)
            );
          `);
          console.log('Tables created successfully');

          // Insert default categories if they don't exist
          console.log('Checking for existing categories...');
          const existingCategories = await database.getAllAsync('SELECT COUNT(*) as count FROM categories');
          console.log('Existing categories count:', (existingCategories[0] as any).count);
          if ((existingCategories[0] as any).count === 0) {
            console.log('Inserting default categories...');
            const defaultCategories = [
              ['Food & Dining', 'expense', 'restaurant', '#FF6B6B'],
              ['Transportation', 'expense', 'car', '#4ECDC4'],
              ['Shopping', 'expense', 'bag', '#45B7D1'],
              ['Entertainment', 'expense', 'film', '#96CEB4'],
              ['Utilities', 'expense', 'flash', '#FFA07A'],
              ['Healthcare', 'expense', 'medical', '#DDA0DD'],
              ['Salary', 'income', 'briefcase', '#FFEAA7'],
              ['Freelance', 'income', 'laptop', '#98D8C8'],
              ['Investment', 'income', 'trending-up', '#F7DC6F'],
            ];

            for (const [name, type, icon, color] of defaultCategories) {
              await database.runAsync(
                'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
                [name, type, icon, color]
              );
            }
            console.log('Default categories inserted successfully');
          }
          console.log('Database setup completed successfully');
        }
      } catch (e) {
        console.error('Database setup error:', e);
        if (isMounted) {
          setError(e as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setupDatabase();

    return () => {
      isMounted = false;
      db?.closeSync();
    };
  }, []);

  return { db, isLoading, error };
}