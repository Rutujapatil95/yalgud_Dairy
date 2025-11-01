import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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
    if (pin.includes('')) {
      return Alert.alert('Error', 'Please enter all 4 digits');
    }

    const enteredPin = pin.join('');

    try {
      const savedPin = await AsyncStorage.getItem('@user_pin');

      if (!savedPin) {
        // ✅ First time setup
        await AsyncStorage.setItem('@user_pin', JSON.stringify(enteredPin));
        Alert.alert('Success', 'PIN created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Offerscreen'),
          },
        ]);
      } else {
        // ✅ PIN already exists → verify
        if (enteredPin === JSON.parse(savedPin)) {
          Alert.alert('Success', 'PIN verified successfully!', [
            {
              text: 'OK',
              onPress: () => navigation.replace('Offerscreen'),
            },
          ]);
        } else {
          Alert.alert('Error', 'Incorrect PIN');
          setPin(['', '', '', '']);
          animatedScales.forEach(scale => scale.setValue(0));
          inputRefs.current[0]?.focus();
        }
      }
    } catch (error) {
      console.error('Error handling PIN:', error);
      Alert.alert('Error', 'Something went wrong while verifying PIN');
    }
  };

  return (
    <ImageBackground
      source={require('../Images/bgimage.jpg')}
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView style={styles.overlay}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />

        <View style={styles.glassBox}>
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
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  returnKeyType="done"
                  autoFocus={index === 0}
                  selectionColor="#000"
                  secureTextEntry={true}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handlePinSubmit}>
            <Text style={styles.loginText}>🔓 Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default EnterScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  glassBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: 40,
  },
  inputWrapper: {
    width: 60,
    height: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#000',
    borderRadius: 20,
    zIndex: -1,
    opacity: 0.3,
  },
  pinInput: {
    width: 55,
    height: 55,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#000',
    borderWidth: 2,
    color: '#000',
    fontSize: 32,
    textAlign: 'center',
    zIndex: 2,
    padding: 0,
  },
  loginButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
