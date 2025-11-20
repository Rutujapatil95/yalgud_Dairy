import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const RF = size => Math.round((size * width) / 375);

export default function UserDetailsScreen({ route }) {
  const navigation = useNavigation();

  const [storeOpen, setStoreOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('delivery');
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const agentCode = route?.params?.agentCode;

  useEffect(() => {
    if (!agentCode) {
      Alert.alert('Error', 'Agent code not provided');
      setLoading(false);
      return;
    }

    const fetchAgent = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.11:8001/api/agent/${agentCode}`,
        );

        if (response.data.success) {
          setAgent(response.data.data);
        } else {
          Alert.alert('Error', response.data.message || 'Agent not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch agent details');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentCode]);

  const toggleDropdown = type => {
    LayoutAnimation.easeInEaseOut();
    if (type === 'store') setStoreOpen(!storeOpen);
    if (type === 'address') setAddressOpen(!addressOpen);
  };

  const handleContinue = () => {
    navigation.navigate('Offerscreen', {
      selectedAddress,
      agentCode: agent?.AgentCode,
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!agent) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: '#333', fontSize: RF(16) }}>Agent not found</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../Images/bgimage.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingBottom: 40,
          width: width,
        }}
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            ID: <Text style={styles.value}>{agent.AgentCode}</Text>
          </Text>

          <Text style={styles.label}>
            Name: <Text style={styles.value}>{agent.AgentNameEng}</Text>
          </Text>

          <Text style={styles.label}>
            Contact No:{' '}
            <Text style={styles.value}>
              {agent.Mobile && agent.Mobile !== '0' ? agent.Mobile : 'N/A'}
            </Text>
          </Text>

          <Text style={styles.label}>
            Email ID:{' '}
            <Text style={styles.value}>
              {agent.Email && agent.Email !== '0' ? agent.Email : 'N/A'}
            </Text>
          </Text>

          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('store')}
          >
            <Text style={styles.dropdownText}>Shop Details</Text>
            <Ionicons
              name={storeOpen ? 'chevron-up' : 'chevron-down'}
              size={RF(20)}
              color="#555"
            />
          </TouchableOpacity>

          {storeOpen && (
            <View style={styles.dropdownContent}>
              <Text style={styles.dropdownItem}>
                {agent.Address1 && agent.Address1 !== '0'
                  ? agent.Address1
                  : 'No address available'}
              </Text>
              <Text style={styles.dropdownItem}>
                {agent.Address2 && agent.Address2 !== '0' ? agent.Address2 : ''}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown('address')}
          >
            <Text style={styles.dropdownText}>Delivery Address</Text>
            <Ionicons
              name={addressOpen ? 'chevron-up' : 'chevron-down'}
              size={RF(20)}
              color="#555"
            />
          </TouchableOpacity>

          {addressOpen && (
            <View style={styles.dropdownContent}>
              {agent.Address1 ? (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setSelectedAddress('Address1')}
                >
                  <Ionicons
                    name={
                      selectedAddress === 'Address1'
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={RF(20)}
                    color="#007bff"
                  />
                  <Text style={styles.optionText}>{agent.Address1}</Text>
                </TouchableOpacity>
              ) : null}

              {agent.Address2 ? (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setSelectedAddress('Address2')}
                >
                  <Ionicons
                    name={
                      selectedAddress === 'Address2'
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={RF(20)}
                    color="#007bff"
                  />
                  <Text style={styles.optionText}>{agent.Address2}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bg: {
    flex: 1,
    width: width,
    height: height,
  },

  card: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.05,
    alignItems: 'center',
    marginTop: height * 0.28,
    elevation: 6,
  },

  label: {
    fontSize: RF(16),
    fontWeight: '600',
    color: '#222',
    marginVertical: 4,
    textAlign: 'center',
  },

  value: {
    color: '#444',
  },

  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    backgroundColor: '#f8f8f8',
  },

  dropdownText: {
    fontSize: RF(15),
    fontWeight: '600',
  },

  dropdownContent: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#fff',
  },

  dropdownItem: {
    fontSize: RF(14),
    marginBottom: 6,
    color: '#444',
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  optionText: {
    fontSize: RF(14),
    marginLeft: 10,
    flexShrink: 1,
    color: '#444',
  },

  button: {
    backgroundColor: '#007bff',
    width: '90%',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 25,
  },

  buttonText: {
    color: '#fff',
    fontSize: RF(17),
    fontWeight: '700',
    textAlign: 'center',
  },
});
