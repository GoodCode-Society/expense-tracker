import { COLORS } from '@/utils/constants';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterButtonsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ options, selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.button,
              selected === option && styles.selectedButton,
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.buttonText,
              selected === option && styles.selectedButtonText,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedButtonText: {
    color: '#ffffff',
  },
});

export default FilterButtons;