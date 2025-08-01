import { COLORS } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiText, MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function DrawerHeader() {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      style={styles.headerContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800 }}
        style={styles.iconContainer}
      >
        <Ionicons name="wallet" size={36} color="#fff" />
      </MotiView>

      <View style={styles.titleContainer}>
        <MotiText
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 300 }}
          style={styles.title}
        >
          Expense Tracker
        </MotiText>

        <MotiText
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 600 }}
          style={styles.subtitle}
        >
          & Manager
        </MotiText>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  iconContainer: {
    marginBottom: 10,
  },
  titleContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    opacity: 0.9,
  },
});
