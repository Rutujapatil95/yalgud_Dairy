import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../../App';
import { translations } from '../locales/translations';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserDetailsScreen() {
  const navigation = useNavigation();
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  const [storeOpen, setStoreOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('delivery');

  const toggleDropdown = type => {
    LayoutAnimation.easeInEaseOut();
    if (type === 'store') setStoreOpen(!storeOpen);
    if (type === 'address') setAddressOpen(!addressOpen);
  };

  const handleContinue = () => {
    navigation.navigate('Offerscreen', { selectedAddress });
  };

  return (
    <ImageBackground
      source={require('../Images/bgimage.jpg')}
      style={styles.bg}
    >
      <View style={styles.card}>
        <Image
          source={require('../Images/profile.png')}
          style={styles.profileImg}
        />
        <Text style={styles.label}>
          {t.id}: <Text style={styles.value}>YD-FO-2025-014</Text>
        </Text>
        <Text style={styles.label}>
          {t.name}: <Text style={styles.value}>Rahul Patil</Text>
        </Text>
        <Text style={styles.label}>
          {t.contactNo}: <Text style={styles.value}>8476543366</Text>
        </Text>
        <Text style={styles.label}>
          {t.emailId}: <Text style={styles.value}>rahulpatil@gmail.com</Text>
        </Text>

        {/* Shop Details */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('store')}
        >
          <Text style={styles.dropdownText}>{t.shopDetails}</Text>
          <Ionicons
            name={storeOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
        {storeOpen && (
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownItem}>{t.shopAddressFull}</Text>
          </View>
        )}

        {/* Delivery Address */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleDropdown('address')}
        >
          <Text style={styles.dropdownText}>{t.deliveryAddress}</Text>
          <Ionicons
            name={addressOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#555"
          />
        </TouchableOpacity>
        {addressOpen && (
          <View style={styles.dropdownContent}>
            {/* Shop Option */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedAddress('shop')}
            >
              <Ionicons
                name={
                  selectedAddress === 'shop'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color="#007bff"
              />
              <Text style={styles.optionText}>{t.shopOption}</Text>
            </TouchableOpacity>

            {/* Delivery Option */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedAddress('delivery')}
            >
              <Ionicons
                name={
                  selectedAddress === 'delivery'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color="#007bff"
              />
              <Text style={styles.optionText}>{t.deliveryOption}</Text>
            </TouchableOpacity>

            {/* Billing Option */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedAddress('billing')}
            >
              <Ionicons
                name={
                  selectedAddress === 'billing'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color="#007bff"
              />
              <Text style={styles.optionText}>{t.billingOption}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{t.continue}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginVertical: 4,
    textAlign: 'center',
  },
  value: { fontWeight: 'normal', color: '#444' },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  dropdownText: { fontSize: 17, fontWeight: '500', color: '#222' },
  dropdownContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 12,
    marginTop: -8,
    marginBottom: 6,
    elevation: 2,
  },
  dropdownItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flexShrink: 1,
  },
  button: {
    backgroundColor: '#007bff',
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
    shadowColor: '#007bff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
