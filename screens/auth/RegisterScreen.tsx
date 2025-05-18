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
    // Hata ayıklama için konsola bilgi yazdırıyoruz
    console.log('Kayıt işlemi başlatılıyor...');
    console.log('E-posta:', email);
    console.log('Şifre uzunluğu:', password.length);
    
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
    console.log('Supabase signUp fonksiyonu çağrılıyor...');
    
    try {
      // Supabase'e kayıt isteği gönderiliyor
      const { data, error } = await signUp(email, password);
      
      console.log('Supabase yanıtı:', { data, error });
      
      if (error) {
        console.error('Supabase hatası:', error);
        Alert.alert('Kayıt Hatası', error.message || 'Kayıt sırasında bir hata oluştu');
      } else {
        console.log('Kayıt başarılı:', data);
        Alert.alert(
          'Kayıt Başarılı', 
          'Hesabınız oluşturuldu. Lütfen e-posta adresinize gönderilen doğrulama bağlantısını kontrol edin.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      console.error('Kayıt işlemi sırasında istisna:', error);
      Alert.alert(
        'Kayıt Hatası', 
        `Kayıt sırasında bir hata oluştu: ${error?.message || 'Bilinmeyen hata'}`
      );
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
            Sağlığınızı takip etmek için hesap oluşturun
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <TextInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.border}
            activeOutlineColor={theme.primary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
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
            secureTextEntry={!showPassword}
            mode="outlined"
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