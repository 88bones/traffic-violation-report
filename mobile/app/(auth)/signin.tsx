import { COLORS } from "@/constant/colors";
import { signin } from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slice";

export default function SignInScreen() {
  const [data, setData] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!data.email || !data.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await signin(data);
      dispatch(setCredentials({ user: response.User, token: response.token }));

      router.replace("/(camera)");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred. Please try again.";
      Alert.alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.content}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Wecome Back!</Text>
          <Text style={styles.headerSubText}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={styles.input}
            placeholder="johndoe@example.com"
            placeholderTextColor={COLORS.darkblue}
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
            placeholderTextColor={COLORS.darkblue}
            autoComplete="password"
            secureTextEntry
            autoCapitalize="none"
            value={data.password}
            onChangeText={(text) => handleChange("password", text)}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          {isLoading ? (
            <ActivityIndicator size={24} color={COLORS.blue} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.linkButtonText}>
            Don't have an account?
            <Text style={styles.linkText}> Sign Up</Text>
          </Text>

          {error && (
            <View>
              <Text>{error}</Text>
            </View>
          )}
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
  },
  headerText: {
    fontSize: 24,
    color: COLORS.light,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: "500",
  },
  form: {
    justifyContent: "center",
    width: "100%",
    // backgroundColor: COLORS.light,
    // borderRadius: 12,
    marginTop: 24,
  },
  error: {
    color: "red",
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    color: COLORS.light,
    fontWeight: "600",
    lineHeight: 16,
    paddingBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.darkblue,
    padding: 16,
    marginBottom: 8,
    color: COLORS.blue,
    backgroundColor: COLORS.light,
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
