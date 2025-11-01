import React, { useState, useContext, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { LanguageContext } from "../../App";
import { translations } from "../locales/translations";

// Get device width & height
const { width, height } = Dimensions.get("window");

// ✅ Responsive scaling helpers
const guidelineBaseWidth = 375; // iPhone X width
const guidelineBaseHeight = 812;

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const SignupScreen = () => {
  const navigation = useNavigation();
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [iconsLoaded, setIconsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Ionicons.loadFont().then(() => setIconsLoaded(true));
  }, []);

  const handleSignup = async () => {
    if (!name || !mobile || !email || !address) {
      Alert.alert(
        t.error || "Error",
        t.fillAllFields || "Please fill all fields"
      );
      return;
    }
    if (mobile.length !== 10) {
      Alert.alert(t.error || "Error", t.invalidMobile || "Invalid mobile number");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://192.168.1.5:8000/api/signup", {
        name,
        email,
        contactNumber: mobile,
        address,
      });

      if (res.data) {
        Alert.alert(
          t.success || "Success",
          t.accountCreated ||
            "Signup request submitted successfully. Check your email for login credentials.",
          [
            {
              text: "OK",
              onPress: () => navigation.replace("LoginScreen"),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        t.signupFailed || "Signup Failed",
        err?.response?.data?.message ||
          t.somethingWrong ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!iconsLoaded)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#8CC3E2" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../Images/headerimage.jpg")}
            style={styles.headerImage}
            resizeMode="cover"
          />

          <View style={styles.innerContainer}>
            <Image
              source={require("../Images/logoto.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.signupTitle}>
              {t.signupTitle || "Sign Up"}
            </Text>

            <Text style={styles.label}>{t.fullName || "Full Name"}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={moderateScale(22)}
                color="#1A1175"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t.enterName || "Enter your full name"}
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.label}>{t.mobile || "Mobile"}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={moderateScale(22)}
                color="#1A1175"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t.enterMobile || "Enter mobile number"}
                value={mobile}
                onChangeText={setMobile}
                style={styles.input}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.label}>{t.email || "Email"}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={moderateScale(22)}
                color="#1A1175"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t.enterEmail || "Enter your email"}
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            <Text style={styles.label}>{t.Address || "Address"}</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="home-outline"
                size={moderateScale(22)}
                color="#1A1175"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder={t.enterAddress || "Enter your address"}
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t.submit || "Submit"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Image
            source={require("../Images/footerimage.png")}
            style={styles.footerImage}
            resizeMode="cover"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: verticalScale(50) },
  headerImage: { width: "100%", height: verticalScale(170), marginBottom: scale(30) },
  footerImage: { width: "100%", height: verticalScale(130), marginTop: -1 },
  innerContainer: { alignItems: "center", paddingHorizontal: scale(30) },
  logo: {
    width: scale(120),
    height: scale(100),
    marginBottom: verticalScale(40),
    marginTop: -verticalScale(60),
  },
  signupTitle: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: "#1A1175",
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1A1175",
    alignSelf: "flex-start",
    marginTop: verticalScale(1),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1175",
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(10),
    marginTop: verticalScale(1),
  },
  inputIcon: { marginRight: scale(10) },
  input: {
    flex: 1,
    height: verticalScale(45),
    color: "#000",
    fontSize: moderateScale(15),
  },
  submitButton: {
    marginTop: verticalScale(20),
    backgroundColor: "#056BF1",
    width: "100%",
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },
});

export default SignupScreen;
