import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const rW = pct => (width * pct) / 100;
const rH = pct => (height * pct) / 100;
const rF = size => size * (width / 375);

const EnterScreen = () => {
  const navigation = useNavigation();
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const animatedScales = useRef(pin.map(() => new Animated.Value(0))).current;

  const handleChange = (text, index) => {
    if (text && !/^\d$/.test(text)) return;

    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    Animated.timing(animatedScales[index], {
      toValue: text ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace') {
      if (pin[index]) {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
      }
    }
  };

  const handlePinSubmit = async () => {
    if (pin.includes('')) return Alert.alert('Error', 'Enter all 4 digits');
    const enteredPin = pin.join('');

    try {
      const res = await axios.post(
        'http://192.168.1.11:8001/api/user/verify-pin',
        { pin: enteredPin },
      );

      Alert.alert('Success', res.data.message);

      setPin(['', '', '', '']);
      animatedScales.forEach(s => s.setValue(0));
      inputRefs.current[0]?.focus();

      navigation.replace('Offerscreen');
    } catch (error) {
      setPin(['', '', '', '']);
      animatedScales.forEach(s => s.setValue(0));
      inputRefs.current[0]?.focus();

      Alert.alert('Error', error.response?.data?.message || 'Incorrect PIN');
    }
  };

  const goToHome = () => {
    navigation.replace('home');
  };

  return (
    <ImageBackground
      source={require('../Images/bgimage.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Enter PIN</Text>

        <View style={styles.pinRow}>
          {pin.map((digit, index) => (
            <View key={index} style={styles.inputWrapper}>
              <Animated.View
                style={[
                  styles.circleBackground,
                  {
                    transform: [{ scale: animatedScales[index] }],
                    opacity: animatedScales[index],
                  },
                ]}
              />

              <TextInput
                ref={ref => (inputRefs.current[index] = ref)}
                style={styles.pinInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={t => handleChange(t, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                autoFocus={index === 0}
                secureTextEntry={true}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handlePinSubmit}>
          <Text style={styles.loginText}> Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.loginButton,
            { marginTop: rH(2), backgroundColor: '#28a745' },
          ]}
          onPress={goToHome}
        >
          <Text style={styles.loginText}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

const BOX = rW(16);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: width,
    height: height,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rW(5),
  },

  title: {
    fontSize: rF(28),
    fontWeight: 'bold',
    marginBottom: rH(5),
    color: '#000',
  },

  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: rW(70),
    marginBottom: rH(5),
  },

  inputWrapper: {
    width: BOX,
    height: BOX,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleBackground: {
    position: 'absolute',
    width: BOX,
    height: BOX,
    backgroundColor: '#000',
    borderRadius: 20,
    zIndex: -1,
    opacity: 0.3,
  },

  pinInput: {
    width: BOX * 0.9,
    height: BOX * 0.9,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderColor: '#000',
    borderWidth: 2,
    color: '#000',
    fontSize: rF(30),
    textAlign: 'center',
    zIndex: 2,
  },

  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: rH(1.5),
    paddingHorizontal: rW(20),
    borderRadius: 10,
  },

  loginText: {
    color: '#fff',
    fontSize: rF(17),
    fontWeight: 'bold',
  },
});

export default EnterScreen;
