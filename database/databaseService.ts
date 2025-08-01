import * as SQLite from 'expo-sqlite';
import { Category, DashboardStats, Transaction } from '../hooks/useDatabase';

export class DatabaseService {
  constructor(private db: SQLite.SQLiteDatabase) { }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<SQLite.SQLiteRunResult> {
    return this.db.runSync(
      'INSERT INTO transactions (amount, type, category_id, description, date) VALUES (?, ?, ?, ?, ?)',
      [transaction.amount, transaction.type, transaction.category_id, transaction.description, transaction.date]
    );
  }

  async getTransactions(filters: {
    type?: string;
    dateRange?: { start: string; end: string };
  } = {}): Promise<Transaction[]> {
    try {
      console.log('Calling getTransactions...');
      
      // First check if transactions table exists
      const tableCheck = this.db.getAllSync(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'
      `);
      
      if (tableCheck.length === 0) {
        console.log('Transactions table does not exist');
        return [];
      }

      let query = `
        SELECT t.*, c.name as category_name, c.icon, c.color 
        FROM transactions t 
        LEFT JOIN categories c ON t.category_id = c.id
      `;
      const params: any[] = [];

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

      const result = this.db.getAllSync(query, params) as Transaction[];
      console.log('Transactions:', result);
      return result;
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  async updateTransaction(id: number, transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<SQLite.SQLiteRunResult> {
    return this.db.runSync(
      'UPDATE transactions SET amount = ?, type = ?, category_id = ?, description = ?, date = ? WHERE id = ?',
      [transaction.amount, transaction.type, transaction.category_id, transaction.description, transaction.date, id]
    );
  }

  async deleteTransaction(id: number): Promise<SQLite.SQLiteRunResult> {
    return this.db.runSync('DELETE FROM transactions WHERE id = ?', [id]);
  }

  async getCategories(type?: string): Promise<Category[]> {
    let query = 'SELECT * FROM categories';
    const params: any[] = [];

    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }

    query += ' ORDER BY name';

    return this.db.getAllSync(query, params) as Category[];
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Calling getDashboardStats...');
      
      // First check if transactions table exists
      const tableCheck = this.db.getAllSync(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'
      `);
      
      if (tableCheck.length === 0) {
        console.log('Transactions table does not exist');
        return {
          totalIncome: 0,
          totalExpense: 0,
          totalTransactions: 0,
          balance: 0
        };
      }

      const result = this.db.getAllSync(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(*) as total_transactions
        FROM transactions
      `);

      const stats = result[0] as any;
      const dashboardStats = {
        totalIncome: stats.total_income || 0,
        totalExpense: stats.total_expense || 0,
        totalTransactions: stats.total_transactions || 0,
        balance: (stats.total_income || 0) - (stats.total_expense || 0)
      };
      
      console.log('Dashboard stats:', dashboardStats);
      return dashboardStats;
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      return {
        totalIncome: 0,
        totalExpense: 0,
        totalTransactions: 0,
        balance: 0
      };
    }
  }
}