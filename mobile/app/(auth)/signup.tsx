import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constant/colors";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState<string>("");

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 10) {
      setPhone(digits);
    }
  };

  const isValid = phone.length === 10;
  const fullPhone = "+977" + phone;

  const handleSubmit = () => {
    if (!isValid) return;

    console.log("Sending OTP to", fullPhone);
    router.push({
      pathname: "/(auth)/verifyotp",
      params: { phone: fullPhone },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.head}>REGISTRATION</Text>
            <Text style={styles.subhead}>Enter your phone number</Text>
            <Text style={styles.sub}>
              We'll send an OTP to verify your number.
            </Text>
            <View style={styles.form}>
              <TextInput readOnly value="+977" style={styles.read} />
              <TextInput
                placeholder="9800000000"
                style={styles.input}
                keyboardType="number-pad"
                value={phone}
                onChangeText={handleChange}
                maxLength={10}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button]}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Send Code</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.linkButtonText}>
            Already have an account?
            <Text style={styles.linkText}> Sign In</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: COLORS.blue,
  },
  keyboard: {
    width: "100%",
  },
  content: {
    justifyContent: "center",
  },

  header: {
    backgroundColor: COLORS.light,
    padding: 16,
    borderRadius: 12,
  },
  head: {
    fontSize: 18,
    color: COLORS.darkblue,
  },
  subhead: {
    fontSize: 32,
    marginTop: 8,
    fontWeight: "900",
    width: "80%",
    color: COLORS.blue,
  },
  sub: {
    fontSize: 14,
    marginTop: 4,
    color: "gray",
    marginBottom: 32,
  },
  form: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.darkblue,
  },
  read: {
    borderRightWidth: 1,
    paddingRight: 8,
    borderColor: COLORS.darkblue,
    fontSize: 18,
    padding: 16,
  },
  input: {
    fontSize: 18,
  },
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
  linkButton: { marginTop: 24, alignItems: "center" },
  linkButtonText: { color: COLORS.light, fontSize: 14 },
  linkText: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
