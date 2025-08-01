import { COLORS } from '@/utils/constants';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface ExpenseCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ExpenseCard;