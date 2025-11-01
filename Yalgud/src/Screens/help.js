import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const accent = '#4A1978';

export default function help() {
  const navigation = useNavigation();

  const mobile = '12352142563';
  const email = 'yalgud@gmail.com';

  const handleCall = () => {
    Linking.openURL(`tel:${mobile}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleProceed = () => {
    navigation.replace('SuccessLoginScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#8CC3E2" barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../Images/headerimage.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />

        <View style={styles.innerContainer}>
          <Image
            source={require('../Images/logoto.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.note}>
            For any enquiry or if you face an issue, our customer care team is
            here to help you.
          </Text>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>📞 Mobile:</Text>
            <Text style={styles.value}>{mobile}</Text>
          </View>

          <View style={styles.fieldBox}>
            <Text style={styles.label}>📧 Email:</Text>
            <Text style={styles.value}>{email}</Text>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💡 Tip: For faster enquiry, call us directly. For detailed
              queries, send us an email.
            </Text>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>📞 Call Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
            <Text style={styles.emailButtonText}>📧 Email Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>Proceed</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('../Images/footerimage.png')}
          style={styles.footerImage}
          resizeMode="cover"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  headerImage: { width: '100%', height: height * 0.12 },
  footerImage: { width: '100%', height: height * 0.12, marginTop: 20 },
  innerContainer: { paddingHorizontal: width * 0.08, alignItems: 'center' },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginTop: -30,
    marginBottom: 10,
  },
  note: {
    fontSize: width * 0.042,
    color: '#333',
    textAlign: 'center',
    marginVertical: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
  fieldBox: {
    width: '100%',
    backgroundColor: '#F8F8FF',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: accent,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: accent,
  },
  value: {
    fontSize: width * 0.043,
    color: '#000',
    marginTop: 4,
    fontWeight: '500',
  },
  tipBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  tipText: {
    fontSize: width * 0.038,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  callButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  emailButton: {
    marginTop: 15,
    width: '100%',
    backgroundColor: '#E63946',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  emailButtonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  proceedButton: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#056BF1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '700',
  },
});
