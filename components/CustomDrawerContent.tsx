import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DrawerHeader from './DrawerHeader';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header */}
        <DrawerHeader />

        {/* Navigation Items */}
        <View style={styles.navigationSection}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="help-circle-outline" size={20} color="#a0aec0" />
          <Text style={styles.footerText}>Help & Support</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="log-out-outline" size={20} color="#a0aec0" />
          <Text style={styles.footerText}>Sign Out</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a365d',
  },

  navigationSection: {
    flex: 1,
    paddingTop: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2d3748',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  footerText: {
    color: '#a0aec0',
    marginLeft: 15,
    fontSize: 16,
  },
});

export default CustomDrawerContent;