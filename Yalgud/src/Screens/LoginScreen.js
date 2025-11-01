import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

// Utility scale functions (make all sizes responsive)
const scale = (size) => (width / 375) * size; // 375 = base iPhone width
const verticalScale = (size) => (height / 812) * size; // 812 = base iPhone height
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const LoginScreen = () => {
  const navigation = useNavigation();
  const [agentCode, setAgentCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto navigation if logged in
  useEffect(() => {
    const checkAgentData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("agentData");
        if (storedData) {
          navigation.reset({
            index: 0,
            routes: [{ name: "EnterScreen" }],
          });
        }
      } catch (err) {
        console.error("Error checking agentData:", err);
      }
    };
    checkAgentData();
  }, [navigation]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!agentCode.trim()) {
      Alert.alert("त्रुटी", "कृपया आपला एजंट कोड प्रविष्ट करा");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://192.168.1.5:8000/api/agent/${agentCode}`
      );

      if (response.data.success) {
        const agentData = response.data.data;
        await AsyncStorage.setItem("agentData", JSON.stringify(agentData));

        Alert.alert("सफल", response.data.message, [
          {
            text: "ठीक आहे",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "CreatePinScreen", params: { agentCode } }],
              }),
          },
        ]);
      } else {
        Alert.alert("त्रुटी", response.data.message || "एजंट कोड सापडला नाही");
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert(
        "त्रुटी",
        error.response?.data?.message || "सर्व्हरशी कनेक्शनमध्ये समस्या."
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Image */}
          <Image
            source={require("../Images/headerimage.jpg")}
            style={styles.headerImage}
            resizeMode="cover"
          />

          <View style={styles.innerContainer}>
            {/* Logo */}
            <Image
              source={require("../Images/logoto.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Agent Code Input */}
            <Text style={styles.label}>Agent Code</Text>
            <TextInput
              placeholder="Enter your agent code"
              value={agentCode}
              onChangeText={setAgentCode}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />

            {/* Submit Button */}
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

            {/* Marathi Text */}
            <View style={styles.textContainer}>
              <Text style={styles.marathiText}>
                यलगुड ची उत्पादने खरेदी करण्यास तुम्ही उत्सुक आहात का
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("SignupScreen")}
              >
                <Text style={styles.clickHere}>येथे क्लिक करा</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Image */}
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
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  headerImage: {
    width: "100%",
    height: verticalScale(180),
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    marginTop: verticalScale(20),
  },
  logo: {
    width: scale(140),
    height: scale(140),
    marginBottom: verticalScale(20),
  },
  label: {
    alignSelf: "flex-start",
    fontSize: moderateScale(17),
    fontWeight: "600",
    color: "#000",
    marginBottom: verticalScale(8),
  },
  input: {
    width: "100%",
    height: verticalScale(50),
    borderWidth: 1.5,
    borderColor: "#056BF1",
    borderRadius: 2,
    paddingHorizontal: scale(15),
    fontSize: moderateScale(18),
    color: "#000",
    backgroundColor: "#F8F9FF",
    marginBottom: verticalScale(20),
  },
  submitBtn: {
    backgroundColor: "#056BF1",
    height: verticalScale(40),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    elevation: 5,
  },
  submitText: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontWeight: "700",
  },
  textContainer: {
    marginTop: verticalScale(12),
    alignItems: "center",
  },
  marathiText: {
    color: "#000",
    textAlign: "center",
    fontSize: moderateScale(14.5),
    lineHeight: verticalScale(22),
    paddingHorizontal: width * 0.05,
  },
  clickHere: {
    color: "#056BF1",
    fontWeight: "bold",
    fontSize: moderateScale(15),
    marginTop: verticalScale(5),
    textDecorationLine: "underline",
  },
  footerImage: {
    width: "100%",
    height: verticalScale(150),
    marginTop: verticalScale(30),
  },
});

export default LoginScreen;
