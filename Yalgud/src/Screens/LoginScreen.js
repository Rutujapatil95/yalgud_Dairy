import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const scale = size => (width / 375) * size;
const verticalScale = size => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const LoginScreen = () => {
  const navigation = useNavigation();
  const [agentCode, setAgentCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAgentData = async () => {
      try {
        const savedCode = await AsyncStorage.getItem('agentCode');
        const savedAgent = await AsyncStorage.getItem('agentData');

        if (savedCode && savedAgent) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'EnterScreen' }],
          });
        }
      } catch (err) {
        console.error('❌ Error checking agent data:', err);
      }
    };

    checkAgentData();
  }, [navigation]);

  const handleSubmit = async () => {
    if (!agentCode.trim()) {
      Alert.alert('Error', 'Please enter your agent code.');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Sending API Request...');
      console.log(`URL → http://192.168.1.11:8001/api/agent/${agentCode}`);

      const response = await axios.get(
        `http://192.168.1.11:8001/api/agent/${agentCode}`,
      );

      console.log('📥 API Response:', response.data);

      if (response.data.success) {
        const agentData = response.data.data;

        console.log('📦 Agent Data Received:', agentData);

        await AsyncStorage.multiSet([
          ['agentCode', agentCode],
          ['agentData', JSON.stringify(agentData)],

          ['agentName', agentData.AgentName || ''],
          ['agentNameEng', agentData.AgentNameEng || ''],
          ['agentAddress1', agentData.Address1 || ''],
          ['agentAddress2', agentData.Address2 || ''],
          ['agentVillageCode', String(agentData.VillageCode || '')],
          ['agentPhone', agentData.Phone || ''],
          ['agentMobile', agentData.Mobile || ''],
          ['agentEmail', agentData.Email || ''],
          ['agentLicNo', agentData.LicNo || ''],
          ['agentExpDate', agentData.ExpDate || ''],
          ['agentDepositAmt', String(agentData.DepositAmt || '')],
          ['agentSalesRoute', String(agentData.SalesRouteCode || '')],
          [
            'SalesRateChartEntryNo',
            String(agentData.SalesRateChartEntryNo || '1'),
          ],

          ['agentCloseStatus', agentData.CloseStatus || ''],
          ['agentPAN', agentData.PANo || ''],
          ['agentTIN', agentData.CSTTIN || ''],
          ['agentVATTIN', agentData.VATTIN || ''],
          ['agentSTNO', agentData.STNO || ''],

          ['agentType', agentData.AgentType.toString()],

          ['agentDiscPer', String(agentData.DiscPer || '')],
          ['agentAadhar', agentData.AadharNo || ''],
          ['agentBankCode', String(agentData.BankCode || '')],
          ['agentBdisc', String(agentData.Bdisc || '')],
          ['agentDdisc', String(agentData.Ddisc || '')],
          ['agentSdisc', String(agentData.Sdisc || '')],
          ['agentHdisc', String(agentData.Hdisc || '')],
        ]);

        console.log('💾 ALL Agent Info Saved Successfully!');

        Alert.alert('Success', 'Agent verified successfully.', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'CreatePinScreen', params: { agentCode } }],
              }),
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Agent code not found.');
      }
    } catch (error) {
      console.error('❌ API Error:', error.response?.data || error.message);

      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'There was a problem connecting to the server.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

            <Text style={styles.label}>Agent Code</Text>

            <TextInput
              placeholder="Enter your agent code"
              value={agentCode}
              onChangeText={setAgentCode}
              style={styles.input}
              keyboardType="numeric"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <Image
            source={require('../Images/footerimage.png')}
            style={styles.footerImage}
            resizeMode="cover"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerImage: {
    width: '100%',
    height: verticalScale(180),
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    marginTop: verticalScale(20),
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
    marginBottom: verticalScale(20),
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: moderateScale(17),
    fontWeight: '600',
    color: '#000',
    marginBottom: verticalScale(8),
  },
  input: {
    width: '100%',
    height: verticalScale(50),
    borderWidth: 1.5,
    borderColor: '#056BF1',
    borderRadius: 8,
    paddingHorizontal: scale(15),
    fontSize: moderateScale(18),
    color: '#000',
    backgroundColor: '#F8F9FF',
    marginBottom: verticalScale(20),
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#056BF1',
    height: verticalScale(48),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  submitText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  footerImage: {
    width: '100%',
    height: verticalScale(150),
    marginTop: verticalScale(30),
  },
});

export default LoginScreen;
