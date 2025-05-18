import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Chip, TextInput, SegmentedButtons, RadioButton, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase, db } from '../../lib/supabase';
import { SymptomType, MoodType } from '../../types/models';

const LogScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [activeTab, setActiveTab] = useState('period');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Döngü verileri
  const [periodStarted, setPeriodStarted] = useState(false);
  const [periodFlow, setPeriodFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [periodNotes, setPeriodNotes] = useState('');
  
  // Semptom verileri
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [symptomIntensity, setSymptomIntensity] = useState<'light' | 'medium' | 'severe'>('medium');
  const [symptomNotes, setSymptomNotes] = useState('');
  
  // Ruh hali verileri
  const [selectedMoods, setSelectedMoods] = useState<MoodType[]>([]);
  const [moodIntensity, setMoodIntensity] = useState<'slight' | 'moderate' | 'strong'>('moderate');
  const [moodNotes, setMoodNotes] = useState('');
  
  // İlaç verileri
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationTime, setMedicationTime] = useState(format(new Date(), 'HH:mm'));
  const [medicationTaken, setMedicationTaken] = useState(true);
  const [medicationRecurring, setMedicationRecurring] = useState(false);
  const [medicationNotes, setMedicationNotes] = useState('');
  
  const handleSymptomToggle = (symptom: SymptomType) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };
  
  const handleMoodToggle = (mood: MoodType) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };
  
  const handleSavePeriod = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      if (periodStarted) {
        // Yeni döngü başlat
        const { data, error } = await db.cycles.add({
          user_id: user.id,
          start_date: format(selectedDate, 'yyyy-MM-dd'),
          notes: periodNotes || null
        });
        
        if (error) {
          Alert.alert('Hata', 'Döngü kaydedilirken bir hata oluştu: ' + error.message);
        } else {
          Alert.alert('Başarılı', 'Döngü başlangıcı kaydedildi.');
          setPeriodStarted(false);
          setPeriodFlow('medium');
          setPeriodNotes('');
        }
      } else {
        Alert.alert('Bilgi', 'Döngü başlangıcı işaretlenmedi.');
      }
    } catch (error) {
      console.error('Döngü kaydetme hatası:', error);
      Alert.alert('Hata', 'Döngü kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveSymptoms = async () => {
    if (!user || selectedSymptoms.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir semptom seçin.');
      return;
    }
    
    setLoading(true);
    
    try {
      const promises = selectedSymptoms.map(symptom => {
        return db.symptoms.add({
          user_id: user.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          type: symptom,
          intensity: symptomIntensity,
          notes: symptomNotes || null
        });
      });
      
      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        Alert.alert('Hata', 'Bazı semptomlar kaydedilirken hata oluştu.');
      } else {
        Alert.alert('Başarılı', 'Semptomlar kaydedildi.');
        setSelectedSymptoms([]);
        setSymptomIntensity('medium');
        setSymptomNotes('');
      }
    } catch (error) {
      console.error('Semptom kaydetme hatası:', error);
      Alert.alert('Hata', 'Semptomlar kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveMoods = async () => {
    if (!user || selectedMoods.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir ruh hali seçin.');
      return;
    }
    
    setLoading(true);
    
    try {
      const promises = selectedMoods.map(mood => {
        return db.moods.add({
          user_id: user.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          type: mood,
          intensity: moodIntensity,
          notes: moodNotes || null
        });
      });
      
      const results = await Promise.all(promises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        Alert.alert('Hata', 'Bazı ruh halleri kaydedilirken hata oluştu.');
      } else {
        Alert.alert('Başarılı', 'Ruh halleri kaydedildi.');
        setSelectedMoods([]);
        setMoodIntensity('moderate');
        setMoodNotes('');
      }
    } catch (error) {
      console.error('Ruh hali kaydetme hatası:', error);
      Alert.alert('Hata', 'Ruh halleri kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveMedication = async () => {
    if (!user || !medicationName) {
      Alert.alert('Uyarı', 'Lütfen ilaç adını girin.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await db.medications.add({
        user_id: user.id,
        name: medicationName,
        dosage: medicationDosage || null,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: medicationTime,
        taken: medicationTaken,
        recurring: medicationRecurring,
        recurring_days: medicationRecurring ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] : null,
        notes: medicationNotes || null
      });
      
      if (error) {
        Alert.alert('Hata', 'İlaç kaydedilirken bir hata oluştu: ' + error.message);
      } else {
        Alert.alert('Başarılı', 'İlaç kaydedildi.');
        setMedicationName('');
        setMedicationDosage('');
        setMedicationTime(format(new Date(), 'HH:mm'));
        setMedicationTaken(true);
        setMedicationRecurring(false);
        setMedicationNotes('');
      }
    } catch (error) {
      console.error('İlaç kaydetme hatası:', error);
      Alert.alert('Hata', 'İlaç kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const renderPeriodTab = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Döngü Takibi
        </Text>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>
            Bugün döngünüz başladı mı?
          </Text>
          <SegmentedButtons
            value={periodStarted ? 'yes' : 'no'}
            onValueChange={value => setPeriodStarted(value === 'yes')}
            buttons={[
              { value: 'yes', label: 'Evet' },
              { value: 'no', label: 'Hayır' }
            ]}
            style={styles.segmentedButton}
          />
        </View>
        
        {periodStarted && (
          <>
            <View style={styles.flowContainer}>
              <Text style={[styles.flowLabel, { color: theme.text }]}>
                Akış Yoğunluğu:
              </Text>
              <RadioButton.Group
                value={periodFlow}
                onValueChange={value => setPeriodFlow(value as 'light' | 'medium' | 'heavy')}
              >
                <View style={styles.radioGroup}>
                  <View style={styles.radioButton}>
                    <RadioButton value="light" color={theme.primary} />
                    <Text style={{ color: theme.text }}>Hafif</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="medium" color={theme.primary} />
                    <Text style={{ color: theme.text }}>Orta</Text>
                  </View>
                  <View style={styles.radioButton}>
                    <RadioButton value="heavy" color={theme.primary} />
                    <Text style={{ color: theme.text }}>Ağır</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
            
            <TextInput
              label="Notlar"
              value={periodNotes}
              onChangeText={setPeriodNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.notesInput}
              outlineColor={theme.border}
              activeOutlineColor={theme.primary}
            />
          </>
        )}
        
        <Button
          mode="contained"
          onPress={handleSavePeriod}
          loading={loading}
          disabled={loading}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          labelStyle={{ color: 'white' }}
        >
          Kaydet
        </Button>
      </Card.Content>
    </Card>
  );
  
  const renderSymptomsTab = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Semptom Takibi
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Semptomlarınızı seçin:
        </Text>
        
        <View style={styles.chipsContainer}>
          {Object.values(SymptomType).map(symptom => (
            <Chip
              key={symptom}
              selected={selectedSymptoms.includes(symptom)}
              onPress={() => handleSymptomToggle(symptom)}
              style={[
                styles.chip,
                selectedSymptoms.includes(symptom) ? { backgroundColor: theme.primary + '30' } : null
              ]}
              textStyle={{ color: selectedSymptoms.includes(symptom) ? theme.primary : theme.text }}
              showSelectedCheck={true}
            >
              {symptom === 'cramps' ? 'Kramplar' :
               symptom === 'headache' ? 'Baş ağrısı' :
               symptom === 'backache' ? 'Sırt ağrısı' :
               symptom === 'nausea' ? 'Bulantı' :
               symptom === 'fatigue' ? 'Yorgunluk' :
               symptom === 'bloating' ? 'Şişkinlik' :
               symptom === 'breast_tenderness' ? 'Göğüs hassasiyeti' :
               symptom === 'acne' ? 'Akne' :
               symptom === 'insomnia' ? 'Uykusuzluk' :
               symptom === 'dizziness' ? 'Baş dönmesi' :
               symptom === 'cravings' ? 'Aşerme' :
               symptom === 'diarrhea' ? 'İshal' :
               symptom === 'constipation' ? 'Kabızlık' :
               'Diğer'}
            </Chip>
          ))}
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Yoğunluk:
        </Text>
        
        <RadioButton.Group
          value={symptomIntensity}
          onValueChange={value => setSymptomIntensity(value as 'light' | 'medium' | 'severe')}
        >
          <View style={styles.radioGroup}>
            <View style={styles.radioButton}>
              <RadioButton value="light" color={theme.primary} />
              <Text style={{ color: theme.text }}>Hafif</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="medium" color={theme.primary} />
              <Text style={{ color: theme.text }}>Orta</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="severe" color={theme.primary} />
              <Text style={{ color: theme.text }}>Şiddetli</Text>
            </View>
          </View>
        </RadioButton.Group>
        
        <TextInput
          label="Notlar"
          value={symptomNotes}
          onChangeText={setSymptomNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <Button
          mode="contained"
          onPress={handleSaveSymptoms}
          loading={loading}
          disabled={loading || selectedSymptoms.length === 0}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          labelStyle={{ color: 'white' }}
        >
          Kaydet
        </Button>
      </Card.Content>
    </Card>
  );
  
  const renderMoodsTab = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Ruh Hali Takibi
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Ruh halinizi seçin:
        </Text>
        
        <View style={styles.chipsContainer}>
          {Object.values(MoodType).map(mood => (
            <Chip
              key={mood}
              selected={selectedMoods.includes(mood)}
              onPress={() => handleMoodToggle(mood)}
              style={[
                styles.chip,
                selectedMoods.includes(mood) ? { backgroundColor: theme.primary + '30' } : null
              ]}
              textStyle={{ color: selectedMoods.includes(mood) ? theme.primary : theme.text }}
              showSelectedCheck={true}
            >
              {mood === 'happy' ? 'Mutlu' :
               mood === 'energetic' ? 'Enerjik' :
               mood === 'calm' ? 'Sakin' :
               mood === 'irritable' ? 'Sinirli' :
               mood === 'anxious' ? 'Endişeli' :
               mood === 'sad' ? 'Üzgün' :
               mood === 'depressed' ? 'Depresif' :
               mood === 'mood_swings' ? 'Duygu değişimleri' :
               mood === 'sensitive' ? 'Hassas' :
               mood === 'stressed' ? 'Stresli' :
               'Diğer'}
            </Chip>
          ))}
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Yoğunluk:
        </Text>
        
        <RadioButton.Group
          value={moodIntensity}
          onValueChange={value => setMoodIntensity(value as 'slight' | 'moderate' | 'strong')}
        >
          <View style={styles.radioGroup}>
            <View style={styles.radioButton}>
              <RadioButton value="slight" color={theme.primary} />
              <Text style={{ color: theme.text }}>Hafif</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="moderate" color={theme.primary} />
              <Text style={{ color: theme.text }}>Orta</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="strong" color={theme.primary} />
              <Text style={{ color: theme.text }}>Güçlü</Text>
            </View>
          </View>
        </RadioButton.Group>
        
        <TextInput
          label="Notlar"
          value={moodNotes}
          onChangeText={setMoodNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <Button
          mode="contained"
          onPress={handleSaveMoods}
          loading={loading}
          disabled={loading || selectedMoods.length === 0}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          labelStyle={{ color: 'white' }}
        >
          Kaydet
        </Button>
      </Card.Content>
    </Card>
  );
  
  const renderMedicationsTab = () => (
    <Card style={[styles.card, { backgroundColor: theme.card }]}>
      <Card.Content>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          İlaç Takibi
        </Text>
        
        <TextInput
          label="İlaç Adı"
          value={medicationName}
          onChangeText={setMedicationName}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <TextInput
          label="Doz (ör. 500mg, 1 tablet)"
          value={medicationDosage}
          onChangeText={setMedicationDosage}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <TextInput
          label="Zaman"
          value={medicationTime}
          onChangeText={setMedicationTime}
          mode="outlined"
          style={styles.input}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
          keyboardType="numeric"
          right={<TextInput.Affix text="(24 saat)" />}
        />
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>
            İlaç alındı mı?
          </Text>
          <SegmentedButtons
            value={medicationTaken ? 'yes' : 'no'}
            onValueChange={value => setMedicationTaken(value === 'yes')}
            buttons={[
              { value: 'yes', label: 'Evet' },
              { value: 'no', label: 'Hayır' }
            ]}
            style={styles.segmentedButton}
          />
        </View>
        
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>
            Tekrarlanan ilaç mı?
          </Text>
          <SegmentedButtons
            value={medicationRecurring ? 'yes' : 'no'}
            onValueChange={value => setMedicationRecurring(value === 'yes')}
            buttons={[
              { value: 'yes', label: 'Evet' },
              { value: 'no', label: 'Hayır' }
            ]}
            style={styles.segmentedButton}
          />
        </View>
        
        <TextInput
          label="Notlar"
          value={medicationNotes}
          onChangeText={setMedicationNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
          outlineColor={theme.border}
          activeOutlineColor={theme.primary}
        />
        
        <Button
          mode="contained"
          onPress={handleSaveMedication}
          loading={loading}
          disabled={loading || !medicationName}
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          labelStyle={{ color: 'white' }}
        >
          Kaydet
        </Button>
      </Card.Content>
    </Card>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Veri Girişi</Text>
        <Text style={[styles.date, { color: theme.text }]}>
          {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
        </Text>
      </View>
      
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'period' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => setActiveTab('period')}
          >
            <IconButton icon="water" size={24} iconColor={activeTab === 'period' ? theme.primary : theme.text} />
            <Text style={{ color: activeTab === 'period' ? theme.primary : theme.text }}>
              Döngü
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'symptoms' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => setActiveTab('symptoms')}
          >
            <IconButton icon="medical-bag" size={24} iconColor={activeTab === 'symptoms' ? theme.primary : theme.text} />
            <Text style={{ color: activeTab === 'symptoms' ? theme.primary : theme.text }}>
              Semptomlar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'moods' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => setActiveTab('moods')}
          >
            <IconButton icon="emoticon" size={24} iconColor={activeTab === 'moods' ? theme.primary : theme.text} />
            <Text style={{ color: activeTab === 'moods' ? theme.primary : theme.text }}>
              Ruh Hali
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'medications' && { backgroundColor: theme.primary + '20' }
            ]}
            onPress={() => setActiveTab('medications')}
          >
            <IconButton icon="pill" size={24} iconColor={activeTab === 'medications' ? theme.primary : theme.text} />
            <Text style={{ color: activeTab === 'medications' ? theme.primary : theme.text }}>
              İlaçlar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'period' && renderPeriodTab()}
        {activeTab === 'symptoms' && renderSymptomsTab()}
        {activeTab === 'moods' && renderMoodsTab()}
        {activeTab === 'medications' && renderMedicationsTab()}
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
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
  },
  tabContainer: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleContainer: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  segmentedButton: {
    marginBottom: 10,
  },
  flowContainer: {
    marginBottom: 20,
  },
  flowLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesInput: {
    marginBottom: 20,
  },
  saveButton: {
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 15,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  chip: {
    margin: 4,
  },
  divider: {
    marginVertical: 20,
  },
  input: {
    marginBottom: 15,
  },
});

export default LogScreen;