import React from 'react';
import { Text, View } from 'react-native';
import { useDatabaseService } from '../hooks/useDatabaseService';

export default function DatabaseTest() {
  const { databaseService, isLoading, error, isReady } = useDatabaseService();

  return (
    <View style={{ padding: 20 }}>
      <Text>Database Test</Text>
      <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text>Ready: {isReady ? 'Yes' : 'No'}</Text>
      <Text>Error: {error ? error.message : 'None'}</Text>
      <Text>Service: {databaseService ? 'Available' : 'Not Available'}</Text>
    </View>
  );
}