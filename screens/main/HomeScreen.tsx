import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, IconButton, ProgressBar } from 'react-native-paper';
import { format, addDays, differenceInDays, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, db } from '../../lib/supabase';
import { Cycle, Profile } from '../../types/models';

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState<number | null>(null);
  const [cyclePhase, setCyclePhase] = useState<string>('');
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı profilini al
      const { data: profileData, error: profileError } = await db.profiles.get(user!.id);
      
      if (profileError) {
        console.error('Profil getirme hatası:', profileError);
        return;
      }
      
      if (profileData) {
        setProfile(profileData);
        
        // En son döngü kaydını al
        const { data: cyclesData, error: cyclesError } = await db.cycles.getAll(user!.id);
        
        if (cyclesError) {
          console.error('Döngü getirme hatası:', cyclesError);
          return;
        }
        
        if (cyclesData && cyclesData.length > 0) {
          const latestCycle = cyclesData[0];
          setCurrentCycle(latestCycle);
          
          // Bir sonraki döngü tahminini hesapla
          const cycleLength = profileData.cycle_average_length || 28;
          const startDate = new Date(latestCycle.start_date);
          const nextPeriod = addDays(startDate, cycleLength);
          setNextPeriodDate(nextPeriod);
          
          // Bir sonraki döneme kalan günleri hesapla
          const today = new Date();
          const daysUntil = differenceInDays(nextPeriod, today);
          setDaysUntilNextPeriod(daysUntil);
          
          // Döngü gününü hesapla
          const cycleDayCount = differenceInDays(today, startDate) + 1;
          setCycleDay(cycleDayCount);
          
          // Döngü fazını belirle
          determinePhase(cycleDayCount, cycleLength, profileData.period_average_length || 5);
        }
      }
    } catch (error) {
      console.error('Veri getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const determinePhase = (day: number, cycleLength: number, periodLength: number) => {
    if (day <= periodLength) {
      setCyclePhase('Menstrüasyon');
    } else if (day <= 7) {
      setCyclePhase('Foliküler');
    } else if (day <= 14) {
      setCyclePhase('Ovulasyon');
    } else {
      setCyclePhase('Luteal');
    }
  };
  
  const getPhaseColor = () => {
    switch (cyclePhase) {
      case 'Menstrüasyon':
        return theme.primary;
      case 'Foliküler':
        return '#4CD964';
      case 'Ovulasyon':
        return '#FFCC00';
      case 'Luteal':
        return '#5AC8FA';
      default:
        return theme.primary;
    }
  };
  
  const getCycleProgress = () => {
    if (!cycleDay || !profile?.cycle_average_length) return 0;
    return Math.min(cycleDay / profile.cycle_average_length, 1);
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Merhaba, {profile?.username || 'Kullanıcı'}
        </Text>
        <Text style={[styles.date, { color: theme.text }]}>
          {format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr })}
        </Text>
      </View>
      
      <Card style={[styles.cycleCard, { backgroundColor: theme.card }]}>
        <Card.Content>
          <View style={styles.cycleHeader}>
            <Text style={[styles.cycleTitle, { color: theme.text }]}>
              Döngü Durumu
            </Text>
            <TouchableOpacity>
              <IconButton icon="information" size={20} iconColor={theme.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.phaseContainer}>
            <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
              {cyclePhase} Fazı
            </Text>
            <Text style={[styles.cycleDay, { color: theme.text }]}>
              {cycleDay ? `${cycleDay}. gün` : 'Döngü günü bilinmiyor'}
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={getCycleProgress()}
              color={getPhaseColor()}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text style={{ color: theme.text }}>1</Text>
              <Text style={{ color: theme.text }}>{profile?.cycle_average_length || 28}</Text>
            </View>
          </View>
          
          {nextPeriodDate && (
            <View style={styles.nextPeriodContainer}>
              <Text style={[styles.nextPeriodLabel, { color: theme.text }]}>
                Tahmini bir sonraki döngü:
              </Text>
              <Text style={[styles.nextPeriodDate, { color: theme.primary }]}>
                {format(nextPeriodDate, 'd MMMM yyyy', { locale: tr })}
              </Text>
              <Text style={[styles.daysUntil, { color: theme.text }]}>
                {daysUntilNextPeriod !== null ? `${daysUntilNextPeriod} gün kaldı` : ''}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={[styles.actionCard, { backgroundColor: theme.card }]}>
        <Card.Content>
          <Text style={[styles.actionTitle, { color: theme.text }]}>
            Hızlı İşlemler
          </Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.primary }]}>
                <IconButton icon="water" size={24} iconColor="white" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>
                Döngü Başlat
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#4CD964' }]}>
                <IconButton icon="emoticon" size={24} iconColor="white" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>
                Ruh Hali Ekle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#5AC8FA' }]}>
                <IconButton icon="medical-bag" size={24} iconColor="white" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>
                Semptom Ekle
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFCC00' }]}>
                <IconButton icon="pill" size={24} iconColor="white" />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>
                İlaç Ekle
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={[styles.tipsCard, { backgroundColor: theme.card }]}>
        <Card.Content>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>
            Günün İpucu
          </Text>
          
          <Text style={[styles.tipText, { color: theme.text }]}>
            {cyclePhase === 'Menstrüasyon'
              ? 'Menstrüasyon döneminde ılık duş almak krampları hafifletmeye yardımcı olabilir.'
              : cyclePhase === 'Foliküler'
              ? 'Foliküler fazda enerji seviyeniz yüksektir. Yeni aktivitelere başlamak için iyi bir zaman!'
              : cyclePhase === 'Ovulasyon'
              ? 'Ovulasyon döneminde sosyal etkileşimler için enerjiniz yüksektir.'
              : 'Luteal fazda vücudunuza iyi bakın ve dinlenmeye özen gösterin.'}
          </Text>
          
          <Button
            mode="outlined"
            onPress={() => {}}
            style={[styles.tipsButton, { borderColor: theme.primary }]}
            labelStyle={{ color: theme.primary }}
          >
            Daha Fazla İpucu
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
  },
  cycleCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 4,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cycleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phaseContainer: {
    marginBottom: 15,
  },
  phaseText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cycleDay: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  nextPeriodContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  nextPeriodLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  nextPeriodDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  daysUntil: {
    fontSize: 14,
  },
  actionCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tipsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  tipsButton: {
    marginTop: 5,
  },
});

export default HomeScreen;