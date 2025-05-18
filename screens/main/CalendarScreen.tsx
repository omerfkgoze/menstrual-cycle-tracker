import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { Calendar, DateData } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, db } from '../../lib/supabase';
import { Cycle, Symptom, Mood, Medication, DayData } from '../../types/models';

const CalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDayData, setSelectedDayData] = useState<DayData | null>(null);
  const [markedDates, setMarkedDates] = useState<any>({});
  
  useEffect(() => {
    if (user) {
      fetchCalendarData();
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedDate && cycles.length > 0) {
      generateSelectedDayData();
    }
  }, [selectedDate, cycles, symptoms, moods, medications]);
  
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      // Döngüleri getir
      const { data: cyclesData, error: cyclesError } = await db.cycles.getAll(user!.id);
      
      if (cyclesError) {
        console.error('Döngü getirme hatası:', cyclesError);
        return;
      }
      
      if (cyclesData) {
        setCycles(cyclesData);
      }
      
      // Son 3 aylık semptomları getir
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: symptomsData, error: symptomsError } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', format(threeMonthsAgo, 'yyyy-MM-dd'));
      
      if (symptomsError) {
        console.error('Semptom getirme hatası:', symptomsError);
      } else if (symptomsData) {
        setSymptoms(symptomsData);
      }
      
      // Son 3 aylık ruh hallerini getir
      const { data: moodsData, error: moodsError } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', format(threeMonthsAgo, 'yyyy-MM-dd'));
      
      if (moodsError) {
        console.error('Ruh hali getirme hatası:', moodsError);
      } else if (moodsData) {
        setMoods(moodsData);
      }
      
      // Son 3 aylık ilaçları getir
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user!.id)
        .gte('date', format(threeMonthsAgo, 'yyyy-MM-dd'));
      
      if (medicationsError) {
        console.error('İlaç getirme hatası:', medicationsError);
      } else if (medicationsData) {
        setMedications(medicationsData);
      }
      
      // Takvim işaretlemelerini oluştur
      generateMarkedDates(cyclesData || [], symptomsData || [], moodsData || [], medicationsData || []);
      
    } catch (error) {
      console.error('Veri getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateMarkedDates = (
    cycles: Cycle[],
    symptoms: Symptom[],
    moods: Mood[],
    medications: Medication[]
  ) => {
    const marks: any = {};
    
    // Döngü günlerini işaretle
    cycles.forEach(cycle => {
      if (cycle.start_date) {
        const startDate = new Date(cycle.start_date);
        const endDate = cycle.end_date 
          ? new Date(cycle.end_date) 
          : new Date(startDate.getTime() + (cycle.period_length || 5) * 24 * 60 * 60 * 1000);
        
        // Döngü günlerini işaretle
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          marks[dateStr] = {
            ...marks[dateStr],
            periods: true,
            dots: [...(marks[dateStr]?.dots || []), { color: theme.primary, key: 'period' }],
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
    
    // Semptomları işaretle
    symptoms.forEach(symptom => {
      const dateStr = symptom.date;
      marks[dateStr] = {
        ...marks[dateStr],
        symptoms: true,
        dots: [...(marks[dateStr]?.dots || []), { color: '#5AC8FA', key: 'symptom' }],
      };
    });
    
    // Ruh hallerini işaretle
    moods.forEach(mood => {
      const dateStr = mood.date;
      marks[dateStr] = {
        ...marks[dateStr],
        moods: true,
        dots: [...(marks[dateStr]?.dots || []), { color: '#4CD964', key: 'mood' }],
      };
    });
    
    // İlaçları işaretle
    medications.forEach(medication => {
      const dateStr = medication.date;
      marks[dateStr] = {
        ...marks[dateStr],
        medications: true,
        dots: [...(marks[dateStr]?.dots || []), { color: '#FFCC00', key: 'medication' }],
      };
    });
    
    // Seçili günü işaretle
    marks[selectedDate] = {
      ...marks[selectedDate],
      selected: true,
      selectedColor: theme.primary + '40', // %40 opaklık
    };
    
    setMarkedDates(marks);
  };
  
  const generateSelectedDayData = () => {
    // Seçili gün için döngü bilgisini bul
    const cycleForDay = cycles.find(cycle => {
      const startDate = new Date(cycle.start_date);
      const endDate = cycle.end_date 
        ? new Date(cycle.end_date) 
        : new Date(startDate.getTime() + (cycle.period_length || 5) * 24 * 60 * 60 * 1000);
      
      const selectedDateObj = parseISO(selectedDate);
      return selectedDateObj >= startDate && selectedDateObj <= endDate;
    });
    
    // Seçili gün için semptomları bul
    const symptomsForDay = symptoms.filter(symptom => symptom.date === selectedDate);
    
    // Seçili gün için ruh hallerini bul
    const moodsForDay = moods.filter(mood => mood.date === selectedDate);
    
    // Seçili gün için ilaçları bul
    const medicationsForDay = medications.filter(medication => medication.date === selectedDate);
    
    // Seçili gün verilerini oluştur
    const dayData: DayData = {
      date: selectedDate,
      cycle: cycleForDay || undefined,
      symptoms: symptomsForDay,
      moods: moodsForDay,
      medications: medicationsForDay,
      isPeriod: !!cycleForDay,
      isFertile: false, // Basitleştirmek için şimdilik false
      isOvulation: false, // Basitleştirmek için şimdilik false
    };
    
    setSelectedDayData(dayData);
  };
  
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
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
  
  const getIntensityName = (intensity: string) => {
    const intensityNames: { [key: string]: string } = {
      light: 'Hafif',
      medium: 'Orta',
      severe: 'Şiddetli',
      slight: 'Hafif',
      moderate: 'Orta',
      strong: 'Güçlü'
    };
    
    return intensityNames[intensity] || intensity;
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
        <Text style={[styles.title, { color: theme.text }]}>Takvim</Text>
      </View>
      
      <Calendar
        current={selectedDate}
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          calendarBackground: theme.card,
          textSectionTitleColor: theme.text,
          textSectionTitleDisabledColor: theme.border,
          selectedDayBackgroundColor: theme.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.primary,
          dayTextColor: theme.text,
          textDisabledColor: theme.border,
          dotColor: theme.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.primary,
          disabledArrowColor: theme.border,
          monthTextColor: theme.text,
          indicatorColor: theme.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />
      
      <ScrollView style={styles.detailsContainer}>
        <Text style={[styles.selectedDate, { color: theme.text }]}>
          {format(parseISO(selectedDate), 'd MMMM yyyy, EEEE', { locale: tr })}
        </Text>
        
        {selectedDayData?.isPeriod && (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="water" size={24} iconColor={theme.primary} />
                <Text style={[styles.cardTitle, { color: theme.primary }]}>Döngü</Text>
              </View>
              <Text style={[styles.cardText, { color: theme.text }]}>
                Döngünüzün {selectedDayData.cycle?.period_length || 5} günlük menstrüasyon döneminde.
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {selectedDayData?.symptoms.length ? (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="medical-bag" size={24} iconColor="#5AC8FA" />
                <Text style={[styles.cardTitle, { color: '#5AC8FA' }]}>Semptomlar</Text>
              </View>
              
              {selectedDayData.symptoms.map((symptom, index) => (
                <View key={symptom.id}>
                  <View style={styles.itemContainer}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>
                      {getSymptomName(symptom.type)}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: theme.text }]}>
                      {getIntensityName(symptom.intensity)}
                    </Text>
                    {symptom.notes && (
                      <Text style={[styles.itemNote, { color: theme.text }]}>
                        {symptom.notes}
                      </Text>
                    )}
                  </View>
                  {index < selectedDayData.symptoms.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}
        
        {selectedDayData?.moods.length ? (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="emoticon" size={24} iconColor="#4CD964" />
                <Text style={[styles.cardTitle, { color: '#4CD964' }]}>Ruh Hali</Text>
              </View>
              
              {selectedDayData.moods.map((mood, index) => (
                <View key={mood.id}>
                  <View style={styles.itemContainer}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>
                      {getMoodName(mood.type)}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: theme.text }]}>
                      {getIntensityName(mood.intensity)}
                    </Text>
                    {mood.notes && (
                      <Text style={[styles.itemNote, { color: theme.text }]}>
                        {mood.notes}
                      </Text>
                    )}
                  </View>
                  {index < selectedDayData.moods.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}
        
        {selectedDayData?.medications.length ? (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="pill" size={24} iconColor="#FFCC00" />
                <Text style={[styles.cardTitle, { color: '#FFCC00' }]}>İlaçlar</Text>
              </View>
              
              {selectedDayData.medications.map((medication, index) => (
                <View key={medication.id}>
                  <View style={styles.itemContainer}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>
                      {medication.name}
                    </Text>
                    <Text style={[styles.itemSubtitle, { color: theme.text }]}>
                      {medication.dosage} - {medication.time}
                    </Text>
                    <View style={styles.medicationStatus}>
                      <IconButton
                        icon={medication.taken ? 'check-circle' : 'circle-outline'}
                        size={20}
                        iconColor={medication.taken ? '#4CD964' : theme.text}
                      />
                      <Text style={[styles.statusText, { color: medication.taken ? '#4CD964' : theme.text }]}>
                        {medication.taken ? 'Alındı' : 'Alınmadı'}
                      </Text>
                    </View>
                    {medication.notes && (
                      <Text style={[styles.itemNote, { color: theme.text }]}>
                        {medication.notes}
                      </Text>
                    )}
                  </View>
                  {index < selectedDayData.medications.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}
        
        {!selectedDayData?.isPeriod && 
         !selectedDayData?.symptoms.length && 
         !selectedDayData?.moods.length && 
         !selectedDayData?.medications.length && (
          <Card style={[styles.card, { backgroundColor: theme.card }]}>
            <Card.Content>
              <Text style={[styles.emptyText, { color: theme.text }]}>
                Bu tarih için henüz veri girişi yapılmamış.
              </Text>
              <TouchableOpacity style={styles.addButton}>
                <Text style={[styles.addButtonText, { color: theme.primary }]}>
                  + Veri Ekle
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
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
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    marginLeft: 10,
  },
  itemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  itemNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
  divider: {
    height: 1,
    marginVertical: 5,
  },
  medicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusText: {
    fontSize: 14,
    marginLeft: -5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  addButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;