import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export const BASE_URL = 'http://192.168.1.11:8001';

// RESPONSIVE HELPERS
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const wp = p => (SCREEN_WIDTH * p) / 100;
const hp = p => (SCREEN_HEIGHT * p) / 100;
const scale = size => (SCREEN_WIDTH / 375) * size;
const scaleFont = size => (SCREEN_WIDTH / 375) * size;

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [agentCode, setAgentCode] = useState('');

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const savedCode = await AsyncStorage.getItem('agentCode');
        const savedAgent = await AsyncStorage.getItem('agentData');

        if (savedCode) setAgentCode(savedCode);
        if (savedAgent) setAgentData(JSON.parse(savedAgent));

        if (savedCode) fetchAgentData(savedCode);
      } catch (error) {
        console.log('❌ Error loading AsyncStorage:', error);
      }
    };

    loadStoredData();
  }, []);

  const fetchAgentData = async code => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/agent/${code}`);

      if (response.data.success) {
        const newData = response.data.data;

        setAgentData(newData);
        await AsyncStorage.setItem('agentData', JSON.stringify(newData));
      } else {
        Alert.alert('Error', 'Agent not found');
      }
    } catch (error) {
      console.log('❌ API Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) Alert.alert('Error', response.errorMessage);
      else setProfileImage(response.assets[0].uri);
    });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('agentCode');
          await AsyncStorage.removeItem('agentData');
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F6D7A" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!agentData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No agent data found.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.retryText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: scaleFont(26) }]}>
          👤 My Profile
        </Text>
      </View>

    
      <View style={styles.profileCard}>
        <TouchableOpacity
          onPress={selectProfileImage}
          style={styles.profileImageWrapper}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.vectorPlaceholder}>
              <Ionicons name="person-outline" size={scale(50)} color="#4F6D7A" />
            </View>
          )}

          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={scale(18)} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={[styles.name, { fontSize: scaleFont(18) }]}>
          {agentData.AgentName || 'N/A'}
        </Text>
        <Text style={[styles.subText, { fontSize: scaleFont(15) }]}>
          Agent Code: {agentCode}
        </Text>
      </View>

      {/* DETAILS */}
      <View style={styles.detailsCard}>
        <Text style={[styles.sectionTitle, { fontSize: scaleFont(14) }]}>
          📋 Agent Details
        </Text>

        {[
          { label: 'Agent Name (English)', value: agentData.AgentNameEng },
          { label: 'Address', value: agentData.Address1 },
          { label: 'Email', value: agentData.Email || 'Not Provided' },
          { label: 'License No', value: agentData.LicNo },
          { label: 'Mobile', value: agentData.Mobile },
          { label: 'Phone', value: agentData.Phone || 'Not Provided' },
        ].map((item, index) => (
          <View style={styles.detailRow} key={index}>
            <Text style={[styles.detailLabel, { fontSize: scaleFont(15) }]}>
              {item.label}
            </Text>
            <Text style={[styles.detailValue, { fontSize: scaleFont(15) }]}>
              {item.value || 'N/A'}
            </Text>
          </View>
        ))}
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={scale(20)} color="#fff" />
        <Text style={[styles.logoutText, { fontSize: scaleFont(16) }]}>
          Logout
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default ProfileScreen;



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F5F9' },

  header: {
    backgroundColor: '#056BF1',
    paddingVertical: hp(6),
    alignItems: 'center',
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
    elevation: 5,
  },

  headerTitle: { color: '#fff', fontWeight: '700' },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    marginTop: -hp(6),
    padding: wp(1),
    borderRadius: wp(6),
    elevation: 8,
  },

  profileImageWrapper: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(20),
    borderWidth: 3,
    borderColor: '#4F6D7A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8EDF3',
  },

  profileImage: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(20),
  },

  vectorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  cameraIconContainer: {
    position: 'absolute',
    bottom: hp(1),
    right: hp(1),
    backgroundColor: '#4F6D7A',
    padding: wp(2),
    borderRadius: wp(5),
  },

  name: {
    fontWeight: '700',
    color: '#222',
    marginTop: hp(1.5),
  },

  subText: { color: '#666', marginTop: hp(0.5) },

  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: wp(5),
    marginTop: hp(3),
    padding: wp(2),
    borderRadius: wp(5),
    elevation: 6,
  },

  sectionTitle: {
    color: '#4F6D7A',
    marginBottom: hp(1.5),
    fontWeight: '700',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(1),
    paddingBottom: hp(0.5),
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDD',
  },

  detailLabel: { color: '#444', fontWeight: '600' },
  detailValue: {
    color: '#111',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },

  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: wp(10),
    marginVertical: hp(5),
    backgroundColor: '#056BF1',
    paddingVertical: hp(1.8),
    borderRadius: wp(8),
    elevation: 6,
  },

  logoutText: { color: '#fff', fontWeight: '700', marginLeft: wp(2) },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: hp(1), color: '#4F6D7A', fontWeight: '600' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#777', marginBottom: hp(2), fontSize: scaleFont(16) },
  retryButton: {
    backgroundColor: '#4F6D7A',
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: scaleFont(15) },
});
