import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('agentData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setAgentData(parsedData);
        }
      } catch (error) {
        console.error('Error loading agent data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAgentData();
  }, []);

  const selectProfileImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Cannot select image');
      } else {
        const uri = response.assets[0].uri;
        setProfileImage(uri);
      }
    });
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('agentData');
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!agentData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No agent data found. Please log in again.
        </Text>
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
    <ScrollView style={styles.container}>
      Header
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity
          onPress={selectProfileImage}
          style={styles.profileImageWrapper}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.vectorPlaceholder}>
              <Ionicons name="person-outline" size={60} color="#4A90E2" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera-outline" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{agentData.AgentName || 'N/A'}</Text>
        <Text style={styles.email}>
          Agent Code: {agentData.AgentCode || 'N/A'}
        </Text>
        <Text style={styles.phone}>
          Mobile:{' '}
          {agentData.Mobile && agentData.Mobile !== '0'
            ? agentData.Mobile
            : 'N/A'}
        </Text>

        {/* <TouchableOpacity
          style={styles.editButton}
          onPress={() => Alert.alert('Edit Profile', 'Feature coming soon!')}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity> */}
      </View>
      {/* Details Section */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Agent Details</Text>
        {[
          { label: 'Agent Name (Eng)', value: agentData.AgentNameEng },
          { label: 'Address', value: agentData.Address1 },
          { label: 'Email', value: agentData.Email },
          { label: 'License No', value: agentData.LicNo },
          { label: 'PAN No', value: agentData.PANo },
          { label: 'Sales Route Code', value: agentData.SalesRouteCode },
          { label: 'Deposit Amount', value: `₹${agentData.DepositAmt || 0}` },
        ].map((item, idx) => (
          <View style={styles.detailRow} key={idx}>
            <Text style={styles.label}>{item.label}:</Text>
            <Text style={styles.value}>
              {item.value && item.value !== '0' ? item.value : 'N/A'}
            </Text>
          </View>
        ))}
      </View>
      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: height * 0.05,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -50,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e1e1',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  vectorPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A90E2',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  name: { fontSize: 22, fontWeight: '700', color: '#333' },
  email: { fontSize: 15, color: '#777', marginTop: 4 },
  phone: { fontSize: 15, color: '#777', marginBottom: 10 },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  detailsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: { fontSize: 15, color: '#555', fontWeight: '600' },
  value: { fontSize: 15, color: '#222', fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontSize: 16, color: '#777', marginBottom: 20 },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
