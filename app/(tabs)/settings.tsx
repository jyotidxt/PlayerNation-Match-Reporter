import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { settingsService } from '@/services/settings';

const triggerHaptic = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  }
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadKey() {
      const savedKey = await settingsService.getApiKey();
      // Check if it's not the env key (to let them modify it)
      const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (savedKey && savedKey !== envKey) {
        setApiKey(savedKey);
      }
    }
    loadKey();
  }, []);

  const handleSave = async () => {
    await settingsService.setApiKey(apiKey);
    triggerHaptic();
    setIsSaved(true);
    
    if (Platform.OS === 'web') {
      alert('API Key Saved Successfully!');
    } else {
      Alert.alert('Success', 'Gemini API Key Saved Successfully!');
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleOpenStudio = () => {
    triggerHaptic();
    Linking.openURL('https://aistudio.google.com/');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Google Gemini API Integration
        </Text>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          By default, this app aggregates real statistics from the 2018 World Cup and uses a tactical coach simulator. 
          To unlock real, customized AI analysis, input your Gemini API Key.
        </Text>

        <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Ionicons name="key-outline" size={20} color={themeColors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            placeholder="AIzaSy..."
            placeholderTextColor={themeColors.textSecondary}
            value={apiKey}
            onChangeText={(text) => {
              setApiKey(text);
              setIsSaved(false);
            }}
            secureTextEntry
          />
          {apiKey ? (
            <TouchableOpacity onPress={() => setApiKey('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isSaved ? themeColors.success : Colors[colorScheme].primary },
          ]}
          onPress={handleSave}
        >
          <Ionicons name={isSaved ? 'checkmark-circle' : 'save-outline'} size={18} color="#FFF" />
          <Text style={styles.saveButtonText}>
            {isSaved ? 'API KEY SAVED' : 'SAVE CONFIGURATION'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={24} color={Colors[colorScheme].secondary} />
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>How to get a free API Key?</Text>
        </View>
        <Text style={[styles.cardText, { color: themeColors.textSecondary }]}>
          1. Go to Google AI Studio.{"\n"}
          2. Log in with your Google account.{"\n"}
          3. Click &quot;Get API key&quot; at the top left.{"\n"}
          4. Click &quot;Create API key&quot; and copy it.{"\n"}
          5. Paste the key in the input above.
        </Text>
        <TouchableOpacity style={[styles.linkButton, { borderColor: Colors[colorScheme].secondary }]} onPress={handleOpenStudio}>
          <Text style={[styles.linkButtonText, { color: Colors[colorScheme].secondary }]}>
            Open Google AI Studio
          </Text>
          <Ionicons name="open-outline" size={16} color={Colors[colorScheme].secondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border, marginBottom: 40 }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="football-outline" size={24} color={Colors[colorScheme].primary} />
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>Wyscout Open Dataset</Text>
        </View>
        <Text style={[styles.cardText, { color: themeColors.textSecondary }]}>
          This app utilizes the public Wyscout Match Event dataset from the 2018 FIFA World Cup. 
          The local preprocessing engine compiles over 100,000 matches events (passes, shots, duels) 
          to feed aggregated metrics directly into our coach reporting dashboard.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  section: {
    marginVertical: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md + 2,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.md,
    marginBottom: Layout.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  inputIcon: {
    marginRight: Layout.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  saveButton: {
    height: 48,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.xl,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.sm,
    letterSpacing: 0.8,
  },
  card: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.sm,
  },
  cardText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.md,
    marginBottom: Layout.spacing.md,
  },
  linkButton: {
    height: 40,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: {
    fontSize: Typography.fontSize.sm - 1,
    fontWeight: 'bold',
    marginRight: 6,
  },
});
