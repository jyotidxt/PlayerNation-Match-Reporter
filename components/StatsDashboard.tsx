import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Team {
  id: number;
  name: string;
  score: number;
  stats: {
    possession: number;
    passesTotal: number;
    passesCompleted: number;
    passAccuracy: number;
    shotsTotal: number;
    shotsOnTarget: number;
    shotsAccuracy: number;
    goals: number;
    corners: number;
    fouls: number;
    tackles: number;
    clearances: number;
    saves: number;
    yellowCards: number;
    redCards: number;
  };
}

interface StatsDashboardProps {
  homeTeam: Team;
  awayTeam: Team;
}

export default function StatsDashboard({ homeTeam, awayTeam }: StatsDashboardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const renderStatRow = (
    label: string,
    homeValue: number | string,
    awayValue: number | string,
    homePercent: number, // 0 to 100 representing home proportion
    formatValue: (val: any) => string = (v) => `${v}`
  ) => {
    return (
      <View style={styles.rowContainer} key={label}>
        <View style={styles.rowTextContainer}>
          <Text style={[styles.statValue, { color: Colors[colorScheme].primary }]}>
            {formatValue(homeValue)}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            {label}
          </Text>
          <Text style={[styles.statValue, { color: Colors[colorScheme].secondary }]}>
            {formatValue(awayValue)}
          </Text>
        </View>

        {/* Progress Bar Split */}
        <View style={[styles.barBackground, { backgroundColor: themeColors.border }]}>
          <View
            style={[
              styles.homeBar,
              {
                width: `${homePercent}%`,
                backgroundColor: Colors[colorScheme].primary,
              },
            ]}
          />
          <View
            style={[
              styles.awayBar,
              {
                width: `${100 - homePercent}%`,
                backgroundColor: Colors[colorScheme].secondary,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Helper to calculate home percentage of total for bar representation
  const calcHomePercent = (home: number, away: number): number => {
    const total = home + away;
    if (total === 0) return 50;
    return Math.round((home / total) * 100);
  };

  const homeStats = homeTeam.stats;
  const awayStats = awayTeam.stats;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <Text style={[styles.dashboardTitle, { color: themeColors.text }]}>Match Statistics</Text>

      {renderStatRow(
        'POSSESSION',
        homeStats.possession,
        awayStats.possession,
        homeStats.possession,
        (val) => `${val}%`
      )}

      {renderStatRow(
        'SHOTS ON TARGET',
        homeStats.shotsOnTarget,
        awayStats.shotsOnTarget,
        calcHomePercent(homeStats.shotsOnTarget, awayStats.shotsOnTarget),
        (val) => `${val}`
      )}

      {renderStatRow(
        'TOTAL SHOTS',
        homeStats.shotsTotal,
        awayStats.shotsTotal,
        calcHomePercent(homeStats.shotsTotal, awayStats.shotsTotal)
      )}

      {renderStatRow(
        'PASS ACCURACY',
        homeStats.passAccuracy,
        awayStats.passAccuracy,
        calcHomePercent(homeStats.passAccuracy, awayStats.passAccuracy),
        (val) => `${val}%`
      )}

      {renderStatRow(
        'TOTAL PASSES',
        homeStats.passesTotal,
        awayStats.passesTotal,
        calcHomePercent(homeStats.passesTotal, awayStats.passesTotal)
      )}

      {renderStatRow(
        'TACKLES',
        homeStats.tackles,
        awayStats.tackles,
        calcHomePercent(homeStats.tackles, awayStats.tackles)
      )}

      {renderStatRow(
        'GOALKEEPER SAVES',
        homeStats.saves,
        awayStats.saves,
        calcHomePercent(homeStats.saves, awayStats.saves)
      )}

      {renderStatRow(
        'CORNERS',
        homeStats.corners,
        awayStats.corners,
        calcHomePercent(homeStats.corners, awayStats.corners)
      )}

      {renderStatRow(
        'FOULS',
        homeStats.fouls,
        awayStats.fouls,
        calcHomePercent(homeStats.fouls, awayStats.fouls)
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
  dashboardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    letterSpacing: 1.2,
  },
  rowContainer: {
    marginBottom: Layout.spacing.xl,
  },
  rowTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    flex: 1,
  },
  barBackground: {
    height: 6,
    borderRadius: Layout.borderRadius.round,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  homeBar: {
    height: '100%',
  },
  awayBar: {
    height: '100%',
  },
});
