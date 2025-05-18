import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthScreenNavigationProp } from '../../types/navigation';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { signUp } = useAuth();
  const { theme } = useTheme();
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password: string) => {
    return password.length >= 8;
  };
  
  const handleRegister = async () => {
    // Doğrulama kontrolleri
    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    if (!validateEmail(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    
    if (!validatePassword(password)) {
      Alert.alert('Hata', 'Şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    if (!agreeToTerms) {
      Alert.alert('Hata', 'Devam etmek için kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        Alert.alert('Kayıt Hatası', error.message);
      } else {
        Alert.alert(
          'Kayıt Başarılı',
          'Hesabınız oluşturuldu. Lütfen e-posta adresinize gönderilen doğrulama bağlantısını kontrol edin.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      Alert.alert('Kayıt Hatası', 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Kayıt hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: theme.primary }]}>
            Hesap Oluştur
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text }]}>
            Sağlığınızı takip etmeye başlayın
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
          />
          
          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          
          <TextInput
            label="Şifreyi Onayla"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            style={styles.input}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
          />
          
          <View style={styles.termsContainer}>
            <Checkbox
              status={agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              color={theme.primary}
            />
            <View style={styles.termsTextContainer}>
              <Text style={{ color: theme.text }}>
                <Text>Kabul ediyorum </Text>
                <Text style={{ color: theme.primary }}>Kullanım Koşulları</Text>
                <Text> ve </Text>
                <Text style={{ color: theme.primary }}>Gizlilik Politikası</Text>
              </Text>
            </View>
          </View>
          
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={[styles.button, { backgroundColor: theme.primary }]}
            labelStyle={{ color: 'white' }}
          >
            Kayıt Ol
          </Button>
          
          <View style={styles.loginContainer}>
            <Text style={{ color: theme.text }}>Zaten bir hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 15,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;