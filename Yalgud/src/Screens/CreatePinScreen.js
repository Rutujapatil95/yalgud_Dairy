import React, { useState, useRef, useContext } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageContext } from '../../App';
import { translations } from '../locales/translations';

const { width, height } = Dimensions.get('window');


const baseWidth = 375; // reference width (iPhone 11)
const baseHeight = 812; // reference height (iPhone 11)
const scale = (size) => (width / baseWidth) * size;
const verticalScale = (size) => (height / baseHeight) * size;

const CreatePinScreen = () => {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const navigation = useNavigation();

  const pinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const savePinToStorage = async (pinValue) => {
    try {
      await AsyncStorage.setItem('@user_pin', JSON.stringify(pinValue));
      console.log('✅ PIN saved successfully:', pinValue);
    } catch (error) {
      console.error('❌ Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN.');
    }
  };

  const handleSubmit = async () => {
    if (pin.includes('') || confirmPin.includes('')) {
      Alert.alert(t.error, t.enterAllDigits);
      return;
    }
    if (pin.join('') !== confirmPin.join('')) {
      Alert.alert(t.error, t.pinMismatch);
      return;
    }

    const finalPin = pin.join('');
    await savePinToStorage(finalPin);

    Alert.alert(t.success, t.pinCreated, [
      {
        text: t.ok,
        onPress: () => {
          setPin(['', '', '', '']);
          setConfirmPin(['', '', '', '']);
          navigation.navigate('SuccessLoginScreen');
        },
      },
    ]);
  };

  const renderPinInputs = (values, setValues, refs) => (
    <View style={styles.pinRow}>
      {values.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (refs.current[index] = ref)}
          style={styles.pinInput}
          maxLength={1}
          keyboardType="number-pad"
          value={digit ? '●' : ''}
          onChangeText={(text) => {
            if (!/^\d?$/.test(text)) return;
            const newPin = [...values];
            newPin[index] = text;
            setValues(newPin);
            if (text && index < values.length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              const newPin = [...values];
              if (values[index]) {
                newPin[index] = '';
                setValues(newPin);
              } else if (index > 0) {
                refs.current[index - 1]?.focus();
                newPin[index - 1] = '';
                setValues(newPin);
              }
            }
          }}
          returnKeyType="done"
          autoFocus={refs === pinRefs && index === 0}
          selectionColor="#000"
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
        style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
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

          <Text style={styles.title}>{t.createPin}</Text>

          <View style={styles.pinContainer}>
            <Text style={styles.label}>{t.enterPin}</Text>
            {renderPinInputs(pin, setPin, pinRefs)}

            <Text style={styles.label}>{t.confirmPin}</Text>
            {renderPinInputs(confirmPin, setConfirmPin, confirmPinRefs)}

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
              activeOpacity={0.6}
            >
              <Text style={styles.forgotText}>{t.forgotPin}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitDisabled && { backgroundColor: '#AAA' },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>{t.submit}</Text>
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
  inner: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  headerImage: { width: width, height: verticalScale(130) },
  footerImage: {
    width: width,
    height: verticalScale(120),
    marginTop: verticalScale(20),
    marginBottom: verticalScale(30),
  },
  logo: {
    width: scale(180),
    height: verticalScale(120),
    borderRadius: scale(100),
    marginTop: -verticalScale(5),
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(20),
  },
  pinContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: scale(75),
  },
  label: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#000',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(10),
    alignSelf: 'flex-start',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(10),
  },
  pinInput: {
    width: scale(45),
    height: scale(45),
    backgroundColor: '#fff',
    borderRadius: scale(8),
    textAlign: 'center',
    fontSize: scale(22),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  forgotText: {
    fontSize: scale(12),
    color: '#000',
    marginTop: verticalScale(15),
    textDecorationLine: 'underline',
    alignSelf: 'flex-end',
    marginLeft: scale(150),
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: scale(10),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(80),
    marginTop: verticalScale(30),
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
});

export default CreatePinScreen;
