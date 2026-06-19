import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface TimelineEvent {
  type: 'goal' | 'own_goal' | 'substitution' | 'yellow_card' | 'red_card';
  minute: number;
  displayMinute: string;
  teamId: number;
  playerName: string;
  detail?: string;
}

interface MatchTimelineProps {
  timeline: TimelineEvent[];
  homeTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}

export default function MatchTimeline({ timeline, homeTeamId, homeTeamName, awayTeamName }: MatchTimelineProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return <Ionicons name="football" size={18} color={themeColors.text} />;
      case 'own_goal':
        return <Ionicons name="football" size={18} color={themeColors.error} />;
      case 'substitution':
        return <MaterialCommunityIcons name="swap-horizontal" size={18} color="#FF7A00" />;
      case 'yellow_card':
        return <Ionicons name="square" size={16} color="#FFCC00" />;
      case 'red_card':
        return <Ionicons name="square" size={16} color="#FF3549" />;
      default:
        return <Ionicons name="alert-circle-outline" size={18} color={themeColors.textSecondary} />;
    }
  };

  const getEventTitle = (evt: TimelineEvent) => {
    switch (evt.type) {
      case 'goal':
        return 'GOAL!';
      case 'own_goal':
        return 'OWN GOAL';
      case 'substitution':
        return 'SUBSTITUTION';
      case 'yellow_card':
        return 'YELLOW CARD';
      case 'red_card':
        return 'RED CARD';
      default:
        return 'EVENT';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Match Timeline</Text>
      
      {timeline.length === 0 ? (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
          No major events recorded in the log.
        </Text>
      ) : (
        <View style={styles.timelineContainer}>
          {/* Vertical central line */}
          <View style={[styles.verticalLine, { backgroundColor: themeColors.border }]} />

          {timeline.map((evt, index) => {
            const isHome = evt.teamId === homeTeamId;
            const teamColor = isHome ? Colors[colorScheme].primary : Colors[colorScheme].secondary;
            const teamName = isHome ? homeTeamName : awayTeamName;

            return (
              <View style={styles.eventRow} key={index}>
                {/* Minute marker */}
                <View style={styles.minuteContainer}>
                  <Text style={[styles.minuteText, { color: themeColors.text, backgroundColor: themeColors.border }]}>
                    {evt.displayMinute}&apos;
                  </Text>
                </View>

                {/* Icon wrapper */}
                <View style={[styles.iconWrapper, { backgroundColor: themeColors.card, borderColor: teamColor }]}>
                  {getEventIcon(evt.type)}
                </View>

                {/* Event info card */}
                <View style={[styles.infoCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.eventTitle, { color: teamColor }]}>
                      {getEventTitle(evt)}
                    </Text>
                    <Text style={[styles.teamLabel, { color: themeColors.textSecondary }]}>
                      {teamName}
                    </Text>
                  </View>
                  <Text style={[styles.playerName, { color: themeColors.text }]}>
                    {evt.playerName}
                  </Text>
                  {evt.detail ? (
                    <Text style={[styles.detailText, { color: themeColors.textSecondary }]}>
                      {evt.detail}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    letterSpacing: 1.2,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: Layout.spacing.xl,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: Layout.spacing.sm,
  },
  verticalLine: {
    position: 'absolute',
    left: 45, // aligned with center of circles
    top: 10,
    bottom: 10,
    width: 2,
    zIndex: 1,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    zIndex: 2,
  },
  minuteContainer: {
    width: 40,
    alignItems: 'center',
  },
  minuteText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Layout.spacing.sm,
    zIndex: 3,
  },
  infoCard: {
    flex: 1,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginLeft: Layout.spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: Typography.fontSize.xs - 1,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  teamLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  playerName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: Typography.fontSize.xs,
    marginTop: 2,
  },
});
