import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { apiFetch, setAuthToken } from '../config/api';

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields!');
      return;
    }

    if (!isLogin && !geminiApiKey.trim()) {
      setError('Gemini API Key is required for registration!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { username: username.trim(), password }
        : { username: username.trim(), password, geminiApiKey: geminiApiKey.trim() };

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      await setAuthToken(data.token);
      onAuthSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        
        <View style={styles.iconCircle}>
          <Ionicons name="sparkles" size={32} color={colors.ink} />
        </View>

        <Text style={styles.headerTitle}>Cosmic Sketchbook</Text>
        <Text style={styles.headerSubtitle}>
          {isLogin ? 'Sign in to map your learning journeys' : 'Register to start tracking your skills'}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={colors.inkMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter username..."
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.inkMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter password..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {!isLogin && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gemini API Key</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={18} color={colors.inkMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Required for AI features..."
                value={geminiApiKey}
                onChangeText={setGeminiApiKey}
                secureTextEntry
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>{isLogin ? 'Sign In' : 'Register Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchBtn} 
          onPress={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          <Text style={styles.switchBtnText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.bgPaper,
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    padding: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.noteYellow,
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: 20
  },
  errorBox: {
    backgroundColor: colors.noteRose,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    marginBottom: 16
  },
  errorText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 10,
    backgroundColor: colors.bgPaper
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 6
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 14,
    color: colors.ink
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 3
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchBtn: {
    alignItems: 'center',
    paddingVertical: 8
  },
  switchBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
