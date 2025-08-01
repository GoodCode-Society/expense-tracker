import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('expense_tracker.db');

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create tables using execSync
      db.execSync(`
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
      // Insert default categories
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

      // Check if categories already exist
      const existingCategories = db.getAllSync('SELECT COUNT(*) as count FROM categories');
      if ((existingCategories[0] as any).count === 0) {
        defaultCategories.forEach(([name, type, icon, color]) => {
          db.runSync(
            'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)',
            [name, type, icon, color]
          );
        });
        console.log('Default categories inserted');
      }

      console.log('Database initialized successfully');
      resolve();
    } catch (error) {
      console.error('Database initialization error:', error);
      reject(error);
    }
  });
};

export const addTransaction = (transaction: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        'INSERT INTO transactions (amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?)',
        [transaction.amount, transaction.type, transaction.categoryId, transaction.description, transaction.date]
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const getTransactions = (filters: any = {}): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      let query = `
        SELECT t.*, c.name as category_name, c.icon, c.color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id
      `;
      let params: any[] = [];

      if (filters.type && filters.type !== 'All') {
        query += ' WHERE t.type = ?';
        params.push(filters.type.toLowerCase());
      }

      if (filters.dateRange) {
        const whereClause = params.length > 0 ? ' AND' : ' WHERE';
        query += `${whereClause} t.date >= ? AND t.date <= ?`;
        params.push(filters.dateRange.start, filters.dateRange.end);
      }

      query += ' ORDER BY t.date DESC';

      const result = db.getAllSync(query, params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const updateTransaction = (id: number, transaction: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ? WHERE id = ?',
        [transaction.amount, transaction.type, transaction.categoryId, transaction.description, transaction.date, id]
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteTransaction = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const getCategories = (type?: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      let query = 'SELECT * FROM categories';
      let params: any[] = [];

      if (type) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      query += ' ORDER BY name';

      const result = db.getAllSync(query, params);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const getDashboardStats = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.getAllSync(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(*) as total_transactions
        FROM transactions
      `);
      
      const stats = result[0] as any;
      resolve({
        totalIncome: stats.total_income || 0,
        totalExpense: stats.total_expense || 0,
        totalTransactions: stats.total_transactions || 0,
        balance: (stats.total_income || 0) - (stats.total_expense || 0)
      });
    } catch (error) {
      reject(error);
    }
  });
};