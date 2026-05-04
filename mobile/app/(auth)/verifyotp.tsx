import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constant/colors";
import { useRef, useState, useCallback, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function VerifyOtp() {
  const { phone, otpNumber } = useLocalSearchParams<{
    phone: string;
    otpNumber: string;
  }>();

  const router = useRouter();

  useEffect(() => {
    console.log("Your code is: ", otpNumber);
  }, [otpNumber]);

  const [otp, setOtp] = useState<string>("");
  const inputRef = useRef<TextInput>(null);

  const handleVerify = () => {
    if (otp == otpNumber.toString()) {
      router.replace({
        pathname: "/(auth)/onBoarding",
        params: { phone: phone },
      });
    } else {
      Alert.alert("Error", "OTP could not be verified.");
    }
  };

  return (
    <SafeAreaView style={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Verification Code</Text>
          <Text style={styles.subHeaderText}>
            Enter the verification code we sent to
          </Text>
          <Text style={styles.phoneText}>{phone}</Text>
        </View>
        <View style={{ position: "relative", width: "100%" }}>
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={(val) => setOtp(val.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            caretHidden
            style={styles.hidden}
          />
          <View
            onTouchStart={() => inputRef.current?.focus()}
            style={styles.row}
          >
            {Array(4)
              .fill("")
              .map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.box,
                    otp[i] ? styles.boxFilled : styles.boxEmpty,
                  ]}
                >
                  <Text style={styles.digit}>{otp[i] || ""}</Text>
                </View>
              ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    width: "100%",
    backgroundColor: COLORS.blue,
  },
  keyboard: {
    width: "100%",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    color: COLORS.light,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "bold",
  },
  subHeaderText: {
    color: COLORS.dark,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  phoneText: {
    color: COLORS.light,
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    width: "100%",
    zIndex: 0,
  },
  hidden: {
    position: "absolute",
    color: "transparent",
    zIndex: 1,
    width: "100%",
    height: "100%",
    opacity: 0,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  boxEmpty: {
    borderWidth: 1.5,
    borderColor: COLORS.darkblue,
    backgroundColor: COLORS.light,
  },
  boxFilled: {
    borderWidth: 1.5,
    borderColor: COLORS.light,
    backgroundColor: "#fff",
  },
  digit: { fontSize: 22, fontWeight: "600", color: COLORS.darkblue },
  button: {
    backgroundColor: COLORS.light,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.blue,
  },
});
