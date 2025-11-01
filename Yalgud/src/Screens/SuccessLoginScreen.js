import React, { useContext } from 'react';
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
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../../App';
import { translations } from '../locales/translations';

const { width, height } = Dimensions.get('window');

const scale = size => (width / 375) * size;
const vScale = size => (height / 812) * size;

const SuccessLoginScreen = () => {
  const navigation = useNavigation();
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent
      />

      {/* Header Image */}
      <Image
        source={require('../Images/headerimage.jpg')}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ConfettiCannon count={120} origin={{ x: width / 2, y: 0 }} fadeOut />

        <Text style={styles.congratsText}>{t.congratsText}</Text>
        <Text style={styles.subCongratsText}>{t.subCongratsText}</Text>

        <Image
          source={require('../Images/profile.png')}
          style={styles.profileImage}
          resizeMode="cover"
        />

        <Text style={styles.welcomeText}>{t.welcomeText}</Text>
        <Text style={styles.familyText}>{t.familyText}</Text>

        <View style={styles.profileCard}>
          <Text style={styles.shopName}>{t.shopName}</Text>
          <Text style={styles.shopAddress}>{t.shopAddress}</Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('UserDetailsScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueText}>{t.continue}</Text>
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
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(16),
  },
  headerImage: { width: width, height: height * 0.16 },
  footerImage: {
    width: width,
    height: height * 0.15,
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },
  congratsText: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#2e2e8b',
    marginTop: vScale(20),
    textAlign: 'center',
  },
  subCongratsText: {
    fontSize: scale(16),
    color: '#000',
    marginBottom: vScale(10),
    textAlign: 'center',
  },
  profileImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    borderWidth: 2,
    borderColor: '#2e2e8b',
    marginVertical: vScale(10),
  },
  welcomeText: {
    fontSize: scale(20),
    color: '#000',
    fontWeight: '600',
    marginTop: vScale(10),
  },
  familyText: {
    fontSize: scale(24),
    color: '#2e2e8b',
    fontWeight: 'bold',
    marginBottom: vScale(15),
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: scale(12),
    padding: scale(16),
    width: width * 0.85,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginVertical: vScale(20),
  },
  shopName: { fontSize: scale(17), fontWeight: 'bold', color: '#333' },
  shopAddress: {
    fontSize: scale(13),
    color: '#555',
    marginTop: scale(6),
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007bff',
    borderRadius: scale(10),
    paddingVertical: vScale(12),
    paddingHorizontal: width * 0.3,
    marginTop: vScale(20),
    minHeight: vScale(44),
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SuccessLoginScreen;
