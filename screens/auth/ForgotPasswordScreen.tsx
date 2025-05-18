import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AuthScreenNavigationProp } from '../../types/navigation';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { resetPassword } = useAuth();
  const { theme } = useTheme();
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        Alert.alert('Hata', error.message);
      } else {
        setResetSent(true);
      }
    } catch (error) {
      Alert.alert('Hata', 'Şifre sıfırlama isteği gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Şifre sıfırlama hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <IconButton
        icon="arrow-left"
        size={24}
        onPress={() => navigation.navigate('Login')}
        style={styles.backButton}
        iconColor={theme.primary}
      />
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primary }]}>
          Şifremi Unuttum
        </Text>
        
        {!resetSent ? (
          <>
            <Text style={[styles.description, { color: theme.text }]}>
              Şifrenizi sıfırlamak için lütfen hesabınızla ilişkili e-posta adresini girin.
              Size şifre sıfırlama talimatlarını içeren bir e-posta göndereceğiz.
            </Text>
            
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
            
            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              style={[styles.button, { backgroundColor: theme.primary }]}
              labelStyle={{ color: 'white' }}
            >
              Şifre Sıfırlama Bağlantısı Gönder
            </Button>
          </>
        ) : (
          <>
            <View style={styles.successContainer}>
              <IconButton
                icon="email-check"
                size={50}
                iconColor={theme.success}
                style={styles.successIcon}
              />
              
              <Text style={[styles.successTitle, { color: theme.success }]}>
                E-posta Gönderildi
              </Text>
              
              <Text style={[styles.successDescription, { color: theme.text }]}>
                {email} adresine şifre sıfırlama talimatlarını içeren bir e-posta gönderdik.
                Lütfen gelen kutunuzu kontrol edin ve talimatları izleyin.
              </Text>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={[styles.button, { backgroundColor: theme.primary }]}
                labelStyle={{ color: 'white' }}
              >
                Giriş Ekranına Dön
              </Button>
            </View>
          </>
        )}
        
        <View style={styles.footer}>
          <Text style={{ color: theme.text }}>Hatırladınız mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 25,
  },
  button: {
    marginBottom: 20,
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  successDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ForgotPasswordScreen;