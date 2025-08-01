import { useMemo } from 'react';
import { DatabaseService } from '../database/databaseService';
import { useDatabase } from './useDatabase';

export function useDatabaseService() {
  const { db, isLoading, error } = useDatabase();
  
  const databaseService = useMemo(() => {
    if (!db) {
      console.log('Database not available for service creation');
      return null;
    }
    console.log('Creating database service');
    return new DatabaseService(db);
  }, [db]);

  const isReady = !isLoading && !error && !!databaseService;
  console.log('Database service state:', { isLoading, error: !!error, hasService: !!databaseService, isReady });

  return {
    databaseService,
    isLoading,
    error,
    isReady
  };
}