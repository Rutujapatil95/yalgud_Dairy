import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const baseWidth = 375;
const baseHeight = 812;

const scale = size => (width / baseWidth) * size;
const verticalScale = size => (height / baseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const CreatePinScreen = () => {
  const navigation = useNavigation();

  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const handleSubmit = async () => {
    if (pin.includes('') || confirmPin.includes('')) {
      Alert.alert('Error', 'Please enter all 4 digits in both PIN fields.');
      return;
    }

    if (pin.join('') !== confirmPin.join('')) {
      Alert.alert('Error', 'PIN and Confirm PIN do not match.');
      return;
    }

    const finalPin = pin.join('');

    try {
      await axios.post('http://192.168.1.11:8001/api/user/create-pin', {
        pin: finalPin,
      });

      Alert.alert('Success', 'Your PIN has been created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            navigation.navigate('SuccessLoginScreen');
          },
        },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save PIN on the server.');
    }
  };

  const renderPinInputs = (values, setValues, refs) => (
    <View style={styles.pinRow}>
      {values.map((digit, index) => (
        <TextInput
          key={index}
          ref={ref => (refs.current[index] = ref)}
          style={styles.pinInput}
          maxLength={1}
          keyboardType="number-pad"
          value={digit ? '●' : ''}
          onChangeText={text => {
            if (!/^\d?$/.test(text)) return;

            const updated = [...values];
            updated[index] = text;
            setValues(updated);

            if (text && index < values.length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              const updated = [...values];
              if (values[index]) {
                updated[index] = '';
                setValues(updated);
              } else if (index > 0) {
                refs.current[index - 1]?.focus();
                updated[index - 1] = '';
                setValues(updated);
              }
            }
          }}
          caretHidden={false}
        />
      ))}
    </View>
  );

  const isSubmitDisabled =
    pin.includes('') ||
    confirmPin.includes('') ||
    pin.join('') !== confirmPin.join('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <Image
            source={require('../Images/headerimage.jpg')}
            style={styles.headerImage}
            resizeMode="cover"
          />

          <Image
            source={require('../Images/logoto.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Create Your PIN</Text>

          <View style={styles.pinContainer}>
            <Text style={styles.label}>Enter PIN</Text>
            {renderPinInputs(pin, setPin, pinRefs)}

            <Text style={styles.label}>Confirm PIN</Text>
            {renderPinInputs(confirmPin, setConfirmPin, confirmPinRefs)}

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text style={styles.forgotText}>Forgot your PIN?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled && { backgroundColor: '#AAA' },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: '#fff' },

  scrollContainer: {
    alignItems: 'center',
    paddingBottom: verticalScale(40),
  },

  headerImage: {
    width: '100%',
    height: verticalScale(140),
  },

  logo: {
    width: scale(160),
    height: verticalScale(110),
    marginTop: -verticalScale(10),
    marginBottom: verticalScale(20),
  },

  title: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(15),
  },

  pinContainer: {
    width: '100%',
    paddingHorizontal: width * 0.15,
    alignItems: 'center',
  },

  label: {
    width: '100%',
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#000',
    marginTop: verticalScale(15),
    marginBottom: verticalScale(10),
  },

  pinRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },

  pinInput: {
    width: scale(50),
    height: scale(50),
    backgroundColor: '#fff',
    borderRadius: scale(8),
    textAlign: 'center',
    fontSize: moderateScale(22),
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
    color: '#000',
  },

  forgotText: {
    color: '#000',
    marginTop: verticalScale(10),
    textDecorationLine: 'underline',
    fontSize: moderateScale(12),
    width: '100%',
    textAlign: 'right',
    fontWeight: '700',
    marginLeft: scale(170),
  },

  submitButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(100),
    borderRadius: scale(10),
    marginTop: verticalScale(25),
  },

  submitText: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },

  footerImage: {
    width: '100%',
    height: verticalScale(140),
    marginTop: verticalScale(30),
  },
});

export default CreatePinScreen;
