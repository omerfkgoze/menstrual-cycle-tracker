import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Text, Card, Button, IconButton, TextInput, Divider, Avatar } from 'react-native-paper';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, db } from '../../lib/supabase';
import { Profile } from '../../types/models';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme, isDarkMode, toggleTheme, setThemeMode, themeMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form alanları
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [cycleLength, setCycleLength] = useState('');
  const [periodLength, setPeriodLength] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await db.profiles.get(user!.id);
      
      if (error) {
        console.error('Profil getirme hatası:', error);
        return;
      }
      
      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setFullName(data.full_name || '');
        setCycleLength(data.cycle_average_length?.toString() || '28');
        setPeriodLength(data.period_average_length?.toString() || '5');
        setEmailNotifications(data.email_notifications || true);
        setPushNotifications(data.push_notifications || true);
      }
    } catch (error) {
      console.error('Profil getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await db.profiles.update(user.id, {
        username,
        full_name: fullName,
        cycle_average_length: parseInt(cycleLength) || 28,
        period_average_length: parseInt(periodLength) || 5,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu: ' + error.message);
      } else {
        Alert.alert('Başarılı', 'Profil başarıyla güncellendi.');
        setEditMode(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Çıkış yapma hatası:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Hesabı Sil', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Onaylayın',
              'Bu işlem geri alınamaz. Hesabınızı silmek istediğinize emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Evet, Hesabımı Sil', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoading(true);
                      
                      // Kullanıcının verilerini sil
                      await supabase.from('cycles').delete().eq('user_id', user!.id);
                      await supabase.from('symptoms').delete().eq('user_id', user!.id);
                      await supabase.from('moods').delete().eq('user_id', user!.id);
                      await supabase.from('medications').delete().eq('user_id', user!.id);
                      await supabase.from('profiles').delete().eq('id', user!.id);
                      
                      // Kullanıcı hesabını sil
                      const { error } = await supabase.auth.admin.deleteUser(user!.id);
                      
                      if (error) {
                        Alert.alert('Hata', 'Hesap silinirken bir hata oluştu: ' + error.message);
                      } else {
                        Alert.alert('Başarılı', 'Hesabınız başarıyla silindi.');
                        await signOut();
                      }
                    } catch (error) {
                      console.error('Hesap silme hatası:', error);
                      Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };
  
  const handleExportData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının tüm verilerini getir
      const [cyclesRes, symptomsRes, moodsRes, medicationsRes, profileRes] = await Promise.all([
        supabase.from('cycles').select('*').eq('user_id', user!.id),
        supabase.from('symptoms').select('*').eq('user_id', user!.id),
        supabase.from('moods').select('*').eq('user_id', user!.id),
        supabase.from('medications').select('*').eq('user_id', user!.id),
        supabase.from('profiles').select('*').eq('id', user!.id)
      ]);
      
      // Verileri birleştir
      const exportData = {
        profile: profileRes.data,
        cycles: cyclesRes.data,
        symptoms: symptomsRes.data,
        moods: moodsRes.data,
        medications: medicationsRes.data,
        exportDate: new Date().toISOString()
      };
      
      // Gerçek bir uygulamada burada dosya indirme veya paylaşma işlemi yapılırdı
      Alert.alert(
        'Veri Dışa Aktarma',
        'Verileriniz hazırlandı. Gerçek bir uygulamada bu veriler bir JSON dosyası olarak indirilir veya paylaşılırdı.',
        [{ text: 'Tamam' }]
      );
      
      console.log('Dışa aktarılan veriler:', JSON.stringify(exportData, null, 2));
      
    } catch (error) {
      console.error('Veri dışa aktarma hatası:', error);
      Alert.alert('Hata', 'Veriler dışa aktarılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderProfileInfo = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <View style={styles.profileHeader}>
          <Avatar.Text 
            size={80} 
            label={profile?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'KA'} 
            style={{ backgroundColor: theme.primary }}
          />
          
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {profile?.full_name || 'İsimsiz Kullanıcı'}
            </Text>
            <Text style={[styles.profileUsername, { color: theme.text }]}>
              {profile?.username ? `@${profile.username}` : user?.email || ''}
            </Text>
          </View>
          
          <IconButton 
            icon="pencil" 
            size={24} 
            iconColor={theme.primary}
            onPress={() => setEditMode(true)}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>E-posta:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{user?.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Ortalama Döngü Uzunluğu:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.cycle_average_length || 28} gün</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Ortalama Periyod Uzunluğu:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{profile?.period_average_length || 5} gün</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.text }]}>Son Döngü Başlangıcı:</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {profile?.last_period_start_date 
              ? format(new Date(profile.last_period_start_date), 'd MMMM yyyy', { locale: tr })
              : 'Veri yok'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
  
  const renderEditProfile = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <View style={styles.editHeader}>
          <Text style={[styles.editTitle, { color: theme.text }]}>Profili Düzenle</Text>
          <IconButton 
            icon="close" 
            size={24} 
            iconColor={theme.text}
            onPress={() => setEditMode(false)}
          />
        </View>
        
        <TextInput
          label="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <TextInput
          label="Tam Ad"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <TextInput
          label="Ortalama Döngü Uzunluğu (gün)"
          value={cycleLength}
          onChangeText={setCycleLength}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <TextInput
          label="Ortalama Periyod Uzunluğu (gün)"
          value={periodLength}
          onChangeText={setPeriodLength}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>E-posta Bildirimleri</Text>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={emailNotifications ? theme.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Push Bildirimleri</Text>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: theme.border, true: theme.primary + '80' }}
            thumbColor={pushNotifications ? theme.primary : '#f4f3f4'}
          />
        </View>
        
        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={loading}
          disabled={loading}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          labelStyle={{ color: 'white' }}
        >
          Değişiklikleri Kaydet
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => setEditMode(false)}
          style={[styles.cancelButton, { borderColor: theme.border }]}
          labelStyle={{ color: theme.text }}
        >
          İptal
        </Button>
      </Card.Content>
    </Card>
  );
  
  const renderSettings = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Ayarlar
        </Text>
        
        <View style={styles.settingContainer}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Tema Modu</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'light' && { backgroundColor: theme.primary + '30' }
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Text style={{ color: themeMode === 'light' ? theme.primary : theme.text }}>
                Açık
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'dark' && { backgroundColor: theme.primary + '30' }
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Text style={{ color: themeMode === 'dark' ? theme.primary : theme.text }}>
                Koyu
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.themeButton,
                themeMode === 'system' && { backgroundColor: theme.primary + '30' }
              ]}
              onPress={() => setThemeMode('system')}
            >
              <Text style={{ color: themeMode === 'system' ? theme.primary : theme.text }}>
                Sistem
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Verilerimi Dışa Aktar
          </Text>
          <IconButton icon="download" size={24} iconColor={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Gizlilik Politikası
          </Text>
          <IconButton icon="chevron-right" size={24} iconColor={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Kullanım Koşulları
          </Text>
          <IconButton icon="chevron-right" size={24} iconColor={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Yardım ve Destek
          </Text>
          <IconButton icon="chevron-right" size={24} iconColor={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <Text style={[styles.settingText, { color: theme.text }]}>
            Hakkında
          </Text>
          <IconButton icon="chevron-right" size={24} iconColor={theme.text} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Profil</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {editMode ? renderEditProfile() : renderProfileInfo()}
        
        {!editMode && renderSettings()}
        
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={[styles.logoutButton, { borderColor: theme.primary }]}
            labelStyle={{ color: theme.primary }}
            icon="logout"
          >
            Çıkış Yap
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleDeleteAccount}
            style={[styles.deleteButton, { borderColor: theme.error }]}
            labelStyle={{ color: theme.error }}
            icon="delete"
          >
            Hesabı Sil
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingContainer: {
    marginVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  themeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  logoutButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 30,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  cancelButton: {
    marginBottom: 10,
  },
});

export default ProfileScreen;