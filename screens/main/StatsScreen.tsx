import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { format, differenceInDays, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, db } from '../../lib/supabase';
import { Cycle, Symptom, Mood } from '../../types/models';

const { width } = Dimensions.get('window');

const StatsScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  
  const [averageCycleLength, setAverageCycleLength] = useState<number | null>(null);
  const [averagePeriodLength, setAveragePeriodLength] = useState<number | null>(null);
  const [cycleLengthData, setCycleLengthData] = useState<any>({});
  const [symptomFrequency, setSymptomFrequency] = useState<any>({});
  const [moodFrequency, setMoodFrequency] = useState<any>({});
  
  useEffect(() => {
    if (user) {
      fetchStatsData();
    }
  }, [user]);
  
  const fetchStatsData = async () => {
    try {
      setLoading(true);
      
      // Son 6 aylık döngüleri getir
      const sixMonthsAgo = subMonths(new Date(), 6);
      
      const { data: cyclesData, error: cyclesError } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user!.id)
        .gte('start_date', format(sixMonthsAgo, 'yyyy-MM-dd'))
        .order('start_date', { ascending: false });
      
      if (cyclesError) {
        console.error('Döngü getirme hatası:', cyclesError);
        return;
      }
      
      if (cyclesData) {
        setCycles(cyclesData);
        
        // Ortalama döngü uzunluğunu hesapla
        if (cyclesData.length > 1) {
          const cycleLengths = [];
          for (let i = 0; i < cyclesData.length - 1; i++) {
            const currentCycle = new Date(cyclesData[i].start_date);
            const nextCycle = new Date(cyclesData[i + 1].start_date);
            const length = differenceInDays(currentCycle, nextCycle);
            if (length > 0 && length < 60) { // Anormal değerleri filtrele
              cycleLengths.push(length);
            }
          }
          
          if (cycleLengths.length > 0) {
            const avgCycleLength = Math.round(
              cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
            );
            setAverageCycleLength(avgCycleLength);
            
            // Döngü uzunluğu grafiği için veri oluştur
            const labels = cycleLengths.map((_, index) => `Döngü ${index + 1}`);
            setCycleLengthData({
              labels: labels.slice(-6), // Son 6 döngü
              datasets: [
                {
                  data: cycleLengths.slice(-6), // Son 6 döngü
                  color: (opacity = 1) => theme.primary,
                  strokeWidth: 2
                }
              ]
            });
          }
        }
        
        // Ortalama periyod uzunluğunu hesapla
        const periodLengths = cyclesData
          .filter(cycle => cycle.period_length)
          .map(cycle => cycle.period_length as number);
        
        if (periodLengths.length > 0) {
          const avgPeriodLength = Math.round(
            periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
          );
          setAveragePeriodLength(avgPeriodLength);
        }
      }
      
      // Son 6 aylık semptomları getir
      const { data: symptomsData, error: symptomsError } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', format(sixMonthsAgo, 'yyyy-MM-dd'));
      
      if (symptomsError) {
        console.error('Semptom getirme hatası:', symptomsError);
      } else if (symptomsData) {
        setSymptoms(symptomsData);
        
        // Semptom sıklığını hesapla
        const symptomCounts: { [key: string]: number } = {};
        symptomsData.forEach(symptom => {
          symptomCounts[symptom.type] = (symptomCounts[symptom.type] || 0) + 1;
        });
        
        // Semptom adlarını Türkçeye çevir
        const translatedSymptomCounts: { [key: string]: number } = {};
        Object.entries(symptomCounts).forEach(([type, count]) => {
          const translatedType = getSymptomName(type);
          translatedSymptomCounts[translatedType] = count;
        });
        
        // En sık görülen 5 semptomu seç
        const sortedSymptoms = Object.entries(translatedSymptomCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        setSymptomFrequency({
          labels: sortedSymptoms.map(([type]) => type),
          datasets: [
            {
              data: sortedSymptoms.map(([_, count]) => count)
            }
          ]
        });
      }
      
      // Son 6 aylık ruh hallerini getir
      const { data: moodsData, error: moodsError } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', format(sixMonthsAgo, 'yyyy-MM-dd'));
      
      if (moodsError) {
        console.error('Ruh hali getirme hatası:', moodsError);
      } else if (moodsData) {
        setMoods(moodsData);
        
        // Ruh hali sıklığını hesapla
        const moodCounts: { [key: string]: number } = {};
        moodsData.forEach(mood => {
          moodCounts[mood.type] = (moodCounts[mood.type] || 0) + 1;
        });
        
        // Ruh hali adlarını Türkçeye çevir
        const translatedMoodCounts: { [key: string]: number } = {};
        Object.entries(moodCounts).forEach(([type, count]) => {
          const translatedType = getMoodName(type);
          translatedMoodCounts[translatedType] = count;
        });
        
        // En sık görülen 5 ruh halini seç
        const sortedMoods = Object.entries(translatedMoodCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        setMoodFrequency({
          labels: sortedMoods.map(([type]) => type),
          datasets: [
            {
              data: sortedMoods.map(([_, count]) => count)
            }
          ]
        });
      }
      
    } catch (error) {
      console.error('Veri getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getSymptomName = (type: string) => {
    const symptomNames: { [key: string]: string } = {
      cramps: 'Kramplar',
      headache: 'Baş ağrısı',
      backache: 'Sırt ağrısı',
      nausea: 'Bulantı',
      fatigue: 'Yorgunluk',
      bloating: 'Şişkinlik',
      breast_tenderness: 'Göğüs hassasiyeti',
      acne: 'Akne',
      insomnia: 'Uykusuzluk',
      dizziness: 'Baş dönmesi',
      cravings: 'Aşerme',
      diarrhea: 'İshal',
      constipation: 'Kabızlık',
      other: 'Diğer'
    };
    
    return symptomNames[type] || type;
  };
  
  const getMoodName = (type: string) => {
    const moodNames: { [key: string]: string } = {
      happy: 'Mutlu',
      energetic: 'Enerjik',
      calm: 'Sakin',
      irritable: 'Sinirli',
      anxious: 'Endişeli',
      sad: 'Üzgün',
      depressed: 'Depresif',
      mood_swings: 'Duygu değişimleri',
      sensitive: 'Hassas',
      stressed: 'Stresli',
      other: 'Diğer'
    };
    
    return moodNames[type] || type;
  };
  
  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>İstatistikler</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.card }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Döngü Özeti
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {averageCycleLength || '-'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Ortalama Döngü Uzunluğu (gün)
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {averagePeriodLength || '-'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Ortalama Periyod Uzunluğu (gün)
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {cycles.length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text }]}>
                  Kaydedilen Döngü Sayısı
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {Object.keys(cycleLengthData).length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Döngü Uzunluğu Trendi
              </Text>
              
              <LineChart
                data={cycleLengthData}
                width={width - 50}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                verticalLabelRotation={30}
              />
              
              <Text style={[styles.chartNote, { color: theme.text }]}>
                Son 6 döngünüzün uzunluğu (gün olarak)
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {Object.keys(symptomFrequency).length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                En Sık Görülen Semptomlar
              </Text>
              
              <BarChart
                data={symptomFrequency}
                width={width - 50}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(90, 200, 250, ${opacity})`,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
              />
              
              <Text style={[styles.chartNote, { color: theme.text }]}>
                Son 6 ayda kaydedilen semptom sıklığı
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {Object.keys(moodFrequency).length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                En Sık Görülen Ruh Halleri
              </Text>
              
              <BarChart
                data={moodFrequency}
                width={width - 50}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 217, 100, ${opacity})`,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
              />
              
              <Text style={[styles.chartNote, { color: theme.text }]}>
                Son 6 ayda kaydedilen ruh hali sıklığı
              </Text>
            </Card.Content>
          </Card>
        )}
        
        <Card style={[styles.card, { backgroundColor: theme.card }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              İçgörüler
            </Text>
            
            <Text style={[styles.insightText, { color: theme.text }]}>
              {averageCycleLength
                ? `Döngünüz ortalama ${averageCycleLength} gün sürüyor, bu da genel olarak normal bir döngü uzunluğudur (21-35 gün).`
                : 'Döngü uzunluğu analizleri için daha fazla veri gerekiyor.'}
            </Text>
            
            <Divider style={styles.divider} />
            
            <Text style={[styles.insightText, { color: theme.text }]}>
              {symptoms.length > 0
                ? `En sık görülen semptomunuz "${symptomFrequency.labels?.[0] || 'bilinmiyor'}" olarak kaydedilmiş.`
                : 'Semptom analizleri için daha fazla veri gerekiyor.'}
            </Text>
            
            <Divider style={styles.divider} />
            
            <Text style={[styles.insightText, { color: theme.text }]}>
              {moods.length > 0
                ? `En sık hissettiğiniz duygu "${moodFrequency.labels?.[0] || 'bilinmiyor'}" olarak kaydedilmiş.`
                : 'Ruh hali analizleri için daha fazla veri gerekiyor.'}
            </Text>
          </Card.Content>
        </Card>
        
        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: theme.text }]}>
            Not: Bu istatistikler sadece bilgilendirme amaçlıdır ve tıbbi tavsiye yerine geçmez.
            Sağlık endişeleriniz varsa lütfen bir sağlık uzmanına danışın.
          </Text>
        </View>
      </ScrollView>
    </View>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '48%',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 10,
  },
  divider: {
    marginVertical: 15,
  },
  disclaimer: {
    marginTop: 10,
    marginBottom: 30,
    padding: 10,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default StatsScreen;