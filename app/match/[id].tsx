import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import matchesData from '@/data/summarized_matches.json';
import StatsDashboard from '@/components/StatsDashboard';
import MatchTimeline from '@/components/MatchTimeline';
import CoachReportView from '@/components/CoachReportView';
import { llmService, TacticalReport } from '@/services/llm';

// Safe haptic feedback trigger
const triggerHaptic = async (style = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(style);
    } catch {
      // Ignore
    }
  }
};

const LOADING_STATUSES = [
  'Aggregating Wyscout event feeds...',
  'Deconstructing defensive passing channels...',
  'Evaluating spatial recovery triggers...',
  'Drafting tactical blueprint...',
  'Finalizing head coach narrative...'
];

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Find match by ID
  const match = matchesData.find((m) => m.id.toString() === id);

  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'report'>('stats');
  const [report, setReport] = useState<TacticalReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);

  // Rotation animation for the soccer ball loader
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const statusTimer = useRef<any>(null);

  useEffect(() => {
    if (loadingReport) {
      // Start rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Cycle loading statuses
      let index = 0;
      setLoadingStatusIndex(0);
      statusTimer.current = setInterval(() => {
        index = (index + 1) % LOADING_STATUSES.length;
        setLoadingStatusIndex(index);
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
      }, 2500);
    } else {
      rotateAnim.setValue(0);
      if (statusTimer.current) {
        clearInterval(statusTimer.current);
      }
    }

    return () => {
      if (statusTimer.current) {
        clearInterval(statusTimer.current);
      }
    };
  }, [loadingReport, rotateAnim]);

  if (!match) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: themeColors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={themeColors.error} />
        <Text style={[styles.errorText, { color: themeColors.text }]}>Match Not Found</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: themeColors.primary }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTabPress = async (tab: 'stats' | 'timeline' | 'report') => {
    triggerHaptic();
    setActiveTab(tab);

    if (tab === 'report' && !report && !loadingReport) {
      setLoadingReport(true);
      try {
        const genReport = await llmService.generateTacticalReport(match);
        setReport(genReport);
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        console.error('Failed to generate report', error);
      } finally {
        setLoadingReport(false);
      }
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Scoreboard Header */}
      <View style={[styles.scoreboardHeader, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <Text style={[styles.stageText, { color: themeColors.textSecondary }]}>
          {match.stage.toUpperCase()} • {match.duration.toUpperCase()}
        </Text>

        <View style={styles.scoreRow}>
          {/* Home */}
          <View style={styles.teamHeaderCell}>
            <Text style={[styles.teamHeaderName, { color: themeColors.text }]} numberOfLines={2}>
              {match.homeTeam.name}
            </Text>
            <Text style={[styles.coachText, { color: themeColors.textSecondary }]}>
              Coach: {match.homeTeam.coach}
            </Text>
          </View>

          {/* Scores */}
          <View style={styles.scoreNumberCell}>
            <Text style={[styles.scoreNumber, { color: themeColors.text }]}>
              {match.homeTeam.score} - {match.awayTeam.score}
            </Text>
            {match.homeTeam.scoreHT !== undefined && (
              <Text style={[styles.htScore, { color: themeColors.textSecondary }]}>
                (HT {match.homeTeam.scoreHT} - {match.awayTeam.scoreHT})
              </Text>
            )}
          </View>

          {/* Away */}
          <View style={styles.teamHeaderCell}>
            <Text style={[styles.teamHeaderName, { color: themeColors.text, textAlign: 'right' }]} numberOfLines={2}>
              {match.awayTeam.name}
            </Text>
            <Text style={[styles.coachText, { color: themeColors.textSecondary, textAlign: 'right' }]}>
              Coach: {match.awayTeam.coach}
            </Text>
          </View>
        </View>

        <View style={[styles.venueRow, { borderTopColor: themeColors.border }]}>
          <Ionicons name="location-outline" size={16} color={themeColors.textSecondary} />
          <Text style={[styles.venueText, { color: themeColors.textSecondary }]}>
            {match.venue}
          </Text>
          <Text style={[styles.dateText, { color: themeColors.textSecondary }]}>
            {match.date}
          </Text>
        </View>
      </View>

      {/* Segment Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'stats' && { borderBottomColor: Colors[colorScheme].primary }]}
          onPress={() => handleTabPress('stats')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'stats' ? Colors[colorScheme].primary : themeColors.textSecondary }]}>
            Stats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'timeline' && { borderBottomColor: Colors[colorScheme].primary }]}
          onPress={() => handleTabPress('timeline')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'timeline' ? Colors[colorScheme].primary : themeColors.textSecondary }]}>
            Timeline
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'report' && { borderBottomColor: Colors[colorScheme].primary }]}
          onPress={() => handleTabPress('report')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'report' ? Colors[colorScheme].primary : themeColors.textSecondary }]}>
            Coach Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Active Tab */}
      <View style={styles.tabContent}>
        {activeTab === 'stats' && (
          <StatsDashboard homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        )}

        {activeTab === 'timeline' && (
          <MatchTimeline
            timeline={match.timeline as any}
            homeTeamId={match.homeTeam.id}
            homeTeamName={match.homeTeam.name}
            awayTeamName={match.awayTeam.name}
          />
        )}

        {activeTab === 'report' && (
          <>
            {loadingReport && (
              <View style={styles.loaderContainer}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="football" size={64} color={Colors[colorScheme].primary} />
                </Animated.View>
                <Text style={[styles.loaderStatusText, { color: themeColors.text }]}>
                  {LOADING_STATUSES[loadingStatusIndex]}
                </Text>
                <Text style={[styles.loaderSubText, { color: themeColors.textSecondary }]}>
                  Google Gemini AI is creating a tactical assessment...
                </Text>
              </View>
            )}

            {!loadingReport && report && (
              <CoachReportView
                report={report}
                homeTeamName={match.homeTeam.name}
                awayTeamName={match.awayTeam.name}
              />
            )}
          </>
        )}
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoreboardHeader: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  stageText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
    letterSpacing: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  teamHeaderCell: {
    flex: 2,
  },
  teamHeaderName: {
    fontSize: Typography.fontSize.md + 1,
    fontWeight: 'bold',
    lineHeight: Typography.lineHeight.md,
  },
  coachText: {
    fontSize: 10,
    marginTop: 4,
  },
  scoreNumberCell: {
    flex: 2,
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: '900',
    letterSpacing: 1,
  },
  htScore: {
    fontSize: 10,
    marginTop: 2,
  },
  venueRow: {
    borderTopWidth: 1,
    paddingTop: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
    marginRight: Layout.spacing.lg,
  },
  dateText: {
    fontSize: Typography.fontSize.xs,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  tabContent: {
    marginTop: Layout.spacing.md,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    marginHorizontal: Layout.spacing.lg,
  },
  loaderStatusText: {
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Layout.spacing.xl,
    marginBottom: 4,
  },
  loaderSubText: {
    fontSize: Typography.fontSize.xs,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  backBtn: {
    paddingHorizontal: Layout.spacing.xl,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  backBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
