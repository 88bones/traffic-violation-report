import { COLORS } from "@/constant/colors";
import { signUp } from "@/services/authService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "../../types/types";

export default function OnBoardingScreen() {
  const router = useRouter();
  const { phone: paramPhone } = useLocalSearchParams<{ phone: string }>();

  const [data, setData] = useState<User>({
    phone: paramPhone,
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!data.name || !data.email || !data.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await signUp(data);
      console.log("Signup successful:", response);
      // router.push("/(tabs)");
    } catch (err: any) {
      console.error("Signup error:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <Text style={styles.header}>Complete Your Profile.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            autoCapitalize="words"
            placeholderTextColor={COLORS.dark}
            value={data.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            placeholder="johndoe@example.com"
            placeholderTextColor={COLORS.dark}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            value={data.email}
            onChangeText={(text) => handleChange("email", text)}
          />
          <Text style={styles.label}>Password*</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.dark}
            autoComplete="password"
            secureTextEntry
            autoCapitalize="none"
            value={data.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <Text style={styles.label}>Phone Number*</Text>
          <TextInput readOnly value={paramPhone} style={styles.input} />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {isLoading ? (
            <ActivityIndicator size={24} color={COLORS.blue} />
          ) : (
            <Text style={styles.buttonText}>Complete Setup</Text>
          )}
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
    width: "100%",
    backgroundColor: COLORS.blue,
  },
  keyboard: {
    width: "100%",
  },
  header: {
    fontSize: 24,
    color: COLORS.light,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
  },
  form: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: COLORS.light,
    borderRadius: 12,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.darkblue,
    padding: 16,
    marginBottom: 8,
    color: COLORS.blue,
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
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.blue,
    fontWeight: "600",
    lineHeight: 16,
    paddingBottom: 2,
  },
});
