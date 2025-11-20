import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const scale = size => (width / 375) * size;
const vScale = size => (height / 812) * size;

const SuccessLoginScreen = () => {
  const navigation = useNavigation();
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const stored = await AsyncStorage.getItem('agentData');
        if (stored) setAgentData(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading agent data:', e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: height * 0.45 }}
        />
      </SafeAreaView>
    );
  }

  const userName = agentData?.AgentName?.split(' ')[0] || 'Dear User';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      <Image
        source={require('../Images/headerimage.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ConfettiCannon count={140} origin={{ x: width / 2, y: 0 }} fadeOut />

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to</Text>

          <Text style={styles.familyText}>Yalgud Family</Text>

          <View style={styles.divider} />

          <Text style={styles.userWelcomeText}>
            We are happy to have you with us,
          </Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.shopName}>
            {agentData?.AgentName || 'No Name Available'}
          </Text>

          <Text style={styles.shopAddress}>
            {agentData?.Address1 && agentData?.Address1 !== '0'
              ? `${agentData.Address1}, ${agentData.Address2 || ''}`
              : 'Address not available'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('UserDetailsScreen', {
              agentCode: agentData?.AgentCode,
            })
          }
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      <Image
        source={require('../Images/footerimage.png')}
        style={styles.footerImage}
        resizeMode="cover"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  headerImage: {
    width: width,
    height: height * 0.16,
  },

  footerImage: {
    width: width,
    height: height * 0.15,
    marginTop: vScale(10),
  },

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingBottom: vScale(60),
  },

  congratsEmoji: {
    fontSize: scale(42),
    marginBottom: vScale(8),
  },

  congratsTitle: {
    fontSize: scale(26),
    fontWeight: '800',
    color: '#2e2e8b',
  },

  congratsSubtitle: {
    fontSize: scale(16),
    color: '#555',
    marginTop: vScale(8),
    textAlign: 'center',
  },

  welcomeCard: {
    width: width * 0.9,
    backgroundColor: '#eef2ff',
    paddingVertical: vScale(30),
    paddingHorizontal: scale(20),
    borderRadius: scale(20),
    marginTop: vScale(30),
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  welcomeTitle: {
    fontSize: scale(20),
    color: '#555',
  },

  familyText: {
    fontSize: scale(30),
    fontWeight: '900',
    color: '#2e2e8b',
    marginTop: vScale(5),
    letterSpacing: 1,
  },

  divider: {
    width: '70%',
    height: 1.8,
    backgroundColor: '#2e2e8b',
    marginVertical: vScale(15),
  },

  userWelcomeText: {
    fontSize: scale(15),
    color: '#333',
  },

  userName: {
    fontSize: scale(22),
    fontWeight: '700',
    color: '#1a1a6e',
    marginTop: vScale(8),
  },

  profileCard: {
    backgroundColor: '#f8f8f8',
    width: width * 0.9,
    borderRadius: scale(16),
    padding: scale(20),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 5,
    marginTop: vScale(25),
  },

  shopName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#111',
  },

  shopAddress: {
    fontSize: scale(14),
    color: '#444',
    marginTop: scale(6),
    textAlign: 'center',
  },

  continueButton: {
    backgroundColor: '#007bff',
    borderRadius: scale(12),
    paddingVertical: vScale(14),
    paddingHorizontal: width * 0.3,
    marginTop: vScale(48),
  },

  continueText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: '700',
  },
});

export default SuccessLoginScreen;
