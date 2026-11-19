import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch, setAuthToken } from '../config/api';
import NotebookBackground from '../components/NotebookBackground';

export default function AuthScreen({ onAuthSuccess, navigation, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    if (!isLogin && !geminiApiKey.trim()) {
      setError('Gemini API Key is required to create your personalized paths.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { username: username.trim(), password }
        : {
            username: username.trim(),
            password,
            geminiApiKey: geminiApiKey.trim(),
          };

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      await setAuthToken(data.token);
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(data.token, data.user);
      } else {
        setUser?.(data.user);
        if (data.user?.onboardingCompleted) {
          navigation?.replace('Home');
        } else {
          navigation?.replace('Onboarding');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotebookBackground showMargin={true}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.bgPaper} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Brand Hero */}
            <View style={styles.heroSection}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="notebook-edit-outline"
                  size={36}
                  color={colors.ink}
                />
              </View>
              <Text style={styles.heroTitle}>COSMIC SKETCHBOOK</Text>
              <Text style={styles.heroSubtitle}>
                AI-Powered Interactive Roadmap & Learning Journal
              </Text>
            </View>

            {/* Notebook Form Card */}
            <View style={styles.card}>
              {/* Notebook Tab Switcher */}
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.tab, isLogin && styles.tabActive]}
                  onPress={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                >
                  <MaterialCommunityIcons
                    name="login-variant"
                    size={16}
                    color={isLogin ? colors.ink : colors.inkMuted}
                  />
                  <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.tab, !isLogin && styles.tabActive]}
                  onPress={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                >
                  <MaterialCommunityIcons
                    name="account-plus-outline"
                    size={16}
                    color={!isLogin ? colors.ink : colors.inkMuted}
                  />
                  <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={18}
                    color={colors.error}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color={colors.inkMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. alex_explorer"
                    placeholderTextColor={colors.inkMuted}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={colors.inkMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.inkMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.inkMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Gemini API Key for Register */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>GEMINI API KEY</Text>
                    <Text style={styles.hintText}>Free from Google AI Studio</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="key-outline"
                      size={20}
                      color={colors.inkMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="AIzaSy..."
                      placeholderTextColor={colors.inkMuted}
                      value={geminiApiKey}
                      onChangeText={setGeminiApiKey}
                      secureTextEntry={!showApiKey}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowApiKey(!showApiKey)}
                      style={styles.eyeBtn}
                    >
                      <MaterialCommunityIcons
                        name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.inkMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.submitBtn, loading && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.ink} size="small" />
                ) : (
                  <View style={styles.btnRow}>
                    <MaterialCommunityIcons
                      name={isLogin ? 'arrow-right-bold' : 'sparkles'}
                      size={18}
                      color={colors.ink}
                    />
                    <Text style={styles.submitBtnText}>
                      {isLogin ? 'Sign In to Sketchbook' : 'Start My Learning Path'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Switch Hint */}
              <TouchableOpacity
                style={styles.switchBtn}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                <Text style={styles.switchBtnText}>
                  {isLogin
                    ? "New to Cosmic Sketchbook? Create an account →"
                    : "Already registered? Sign in here →"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </NotebookBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
    flexGrow: 1,
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 1.2,
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 18,
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgPaper,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 3,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.noteYellow,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.inkMuted,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: '900',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.noteRose,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.ink,
    marginBottom: 6,
  },
  hintText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPaper,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
  },
  switchBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
});
