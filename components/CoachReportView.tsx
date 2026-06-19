import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { TacticalReport } from '@/services/llm';

interface CoachReportViewProps {
  report: TacticalReport;
  homeTeamName: string;
  awayTeamName: string;
}

type TabType = 'narrative' | 'teams' | 'players' | 'insights';

export default function CoachReportView({ report, homeTeamName, awayTeamName }: CoachReportViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabType>('narrative');

  const renderTabButton = (tab: TabType, label: string, icon: string) => {
    const isActive = activeTab === tab;
    const activeColor = Colors[colorScheme].primary;
    
    return (
      <TouchableOpacity
        style={[
          styles.tabButton,
          { borderBottomColor: isActive ? activeColor : 'transparent' }
        ]}
        onPress={() => setActiveTab(tab)}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={isActive ? activeColor : themeColors.textSecondary}
        />
        <Text
          style={[
            styles.tabButtonText,
            { color: isActive ? activeColor : themeColors.textSecondary, fontWeight: isActive ? 'bold' : 'normal' }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderNarrative = () => {
    return (
      <View style={styles.contentSection}>
        <View style={[styles.quoteContainer, { backgroundColor: themeColors.background, borderColor: Colors[colorScheme].primary }]}>
          <Ionicons name={"quote" as any} size={32} color={Colors[colorScheme].primary} style={styles.quoteIcon} />
          <Text style={[styles.narrativeText, { color: themeColors.text }]}>
            {report.narrative}
          </Text>
        </View>

        {report.keyMoments && report.keyMoments.length > 0 && (
          <View style={styles.keyMomentsSection}>
            <Text style={[styles.sectionSubtitle, { color: themeColors.text }]}>
              Tactical Key Turning Points
            </Text>
            {report.keyMoments.map((moment, idx) => (
              <View key={idx} style={[styles.momentCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <View style={styles.momentHeader}>
                  <View style={[styles.minuteBadge, { backgroundColor: Colors[colorScheme].primary }]}>
                    <Text style={styles.minuteBadgeText}>{moment.minute}&apos;</Text>
                  </View>
                  <Text style={[styles.momentTitle, { color: themeColors.text }]}>
                    {moment.title}
                  </Text>
                </View>
                <Text style={[styles.momentDesc, { color: themeColors.textSecondary }]}>
                  {moment.description}
                </Text>
                <View style={[styles.impactBox, { borderLeftColor: Colors[colorScheme].secondary }]}>
                  <Text style={[styles.impactLabel, { color: Colors[colorScheme].secondary }]}>Tactical Impact:</Text>
                  <Text style={[styles.impactText, { color: themeColors.text }]}>{moment.tacticalImpact}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTeamAnalysis = () => {
    const renderTeamCard = (teamName: string, data: typeof report.teamAnalysis.home, isHome: boolean) => {
      const accentColor = isHome ? Colors[colorScheme].primary : Colors[colorScheme].secondary;
      return (
        <View style={[styles.teamAnalysisCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
          <Text style={[styles.teamNameTitle, { color: accentColor }]}>{teamName}</Text>
          
          <Text style={[styles.assessmentText, { color: themeColors.text }]}>
            {data.tacticalAssessment}
          </Text>

          <View style={styles.strengthsWeaknessesContainer}>
            <View style={styles.listSection}>
              <Text style={[styles.listTitle, { color: themeColors.success }]}>
                <Ionicons name="checkmark-circle" size={14} color={themeColors.success} /> Strengths
              </Text>
              {data.strengths.map((str, idx) => (
                <Text key={idx} style={[styles.listItemText, { color: themeColors.text }]}>
                  • {str}
                </Text>
              ))}
            </View>

            <View style={styles.listSection}>
              <Text style={[styles.listTitle, { color: themeColors.error }]}>
                <Ionicons name="close-circle" size={14} color={themeColors.error} /> Weaknesses
              </Text>
              {data.weaknesses.map((weak, idx) => (
                <Text key={idx} style={[styles.listItemText, { color: themeColors.text }]}>
                  • {weak}
                </Text>
              ))}
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.contentSection}>
        {renderTeamCard(homeTeamName, report.teamAnalysis.home, true)}
        {renderTeamCard(awayTeamName, report.teamAnalysis.away, false)}
      </View>
    );
  };

  const renderPlayers = () => {
    return (
      <View style={styles.contentSection}>
        <Text style={[styles.sectionSubtitle, { color: themeColors.text, marginBottom: Layout.spacing.md }]}>
          Standout Match Performers
        </Text>
        {report.standoutPerformances.map((perf, idx) => {
          const isHome = perf.teamName.toLowerCase().includes(homeTeamName.toLowerCase()) || 
                         homeTeamName.toLowerCase().includes(perf.teamName.toLowerCase());
          const teamColor = isHome ? Colors[colorScheme].primary : Colors[colorScheme].secondary;
          
          return (
            <View key={idx} style={[styles.playerCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
              <View style={styles.playerHeader}>
                <Ionicons name="person-circle" size={36} color={teamColor} />
                <View style={styles.playerTitleBox}>
                  <Text style={[styles.playerNameText, { color: themeColors.text }]}>
                    {perf.playerName}
                  </Text>
                  <Text style={[styles.playerSubText, { color: themeColors.textSecondary }]}>
                    {perf.teamName} • {perf.role}
                  </Text>
                </View>
              </View>
              <Text style={[styles.playerAnalysisText, { color: themeColors.text }]}>
                {perf.ratingAnalysis}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderInsights = () => {
    return (
      <View style={styles.contentSection}>
        <Text style={[styles.sectionSubtitle, { color: themeColors.text, marginBottom: Layout.spacing.md }]}>
          {"Coach's Actions & Instructions"}
        </Text>
        {report.actionableInsights.map((insight, idx) => {
          const isHome = insight.teamName.toLowerCase().includes(homeTeamName.toLowerCase()) || 
                         homeTeamName.toLowerCase().includes(insight.teamName.toLowerCase());
          const badgeColor = isHome ? Colors[colorScheme].primary : Colors[colorScheme].secondary;
          const targetIcon = insight.target === 'coach' ? 'clipboard-outline' : 'people-outline';
          
          return (
            <View key={idx} style={[styles.insightCard, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
              <View style={styles.insightHeader}>
                <View style={[styles.targetBadge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.targetBadgeText}>
                    {insight.target.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.insightTeamName, { color: themeColors.textSecondary }]}>
                  {insight.teamName}
                </Text>
              </View>
              <View style={styles.insightBody}>
                <Ionicons name={targetIcon as any} size={20} color={badgeColor} style={styles.insightIcon} />
                <Text style={[styles.insightText, { color: themeColors.text }]}>
                  {insight.insight}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
      <Text style={[styles.mainTitle, { color: themeColors.text }]}>Tactical Coach Report</Text>
      
      {/* Sub-Tabs */}
      <View style={[styles.tabsBar, { borderBottomColor: themeColors.border }]}>
        {renderTabButton('narrative', 'Narrative', 'document-text-outline')}
        {renderTabButton('teams', 'Teams', 'shield-outline')}
        {renderTabButton('players', 'Players', 'person-outline')}
        {renderTabButton('insights', 'Insights', 'bulb-outline')}
      </View>

      {/* Tab Contents */}
      <View style={styles.tabContentContainer}>
        {activeTab === 'narrative' && renderNarrative()}
        {activeTab === 'teams' && renderTeamAnalysis()}
        {activeTab === 'players' && renderPlayers()}
        {activeTab === 'insights' && renderInsights()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  mainTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    letterSpacing: 1.2,
  },
  tabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
  },
  tabContentContainer: {
    padding: Layout.spacing.lg,
  },
  contentSection: {
    width: '100%',
  },
  quoteContainer: {
    position: 'relative',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Layout.spacing.xl,
  },
  quoteIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    opacity: 0.15,
  },
  narrativeText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.md,
    fontStyle: 'italic',
    paddingLeft: 12,
  },
  keyMomentsSection: {
    marginTop: Layout.spacing.md,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.lg,
    letterSpacing: 0.5,
  },
  momentCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  momentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  minuteBadge: {
    borderRadius: Layout.borderRadius.xs,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 3,
    marginRight: Layout.spacing.sm,
  },
  minuteBadgeText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: 'bold',
  },
  momentTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    flex: 1,
  },
  momentDesc: {
    fontSize: Typography.fontSize.xs + 1,
    lineHeight: Typography.lineHeight.sm,
    marginBottom: Layout.spacing.sm,
  },
  impactBox: {
    borderLeftWidth: 3,
    paddingLeft: Layout.spacing.sm,
    marginTop: Layout.spacing.xs,
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  impactText: {
    fontSize: Typography.fontSize.xs,
    lineHeight: Typography.lineHeight.xs,
    fontStyle: 'italic',
  },
  teamAnalysisCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.lg,
  },
  teamNameTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
    letterSpacing: 0.8,
  },
  assessmentText: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Typography.lineHeight.md,
    marginBottom: Layout.spacing.md,
  },
  strengthsWeaknessesContainer: {
    marginTop: Layout.spacing.xs,
  },
  listSection: {
    marginBottom: Layout.spacing.md,
  },
  listTitle: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
    letterSpacing: 0.5,
  },
  listItemText: {
    fontSize: Typography.fontSize.xs + 1,
    lineHeight: Typography.lineHeight.sm,
    paddingLeft: Layout.spacing.sm,
    marginVertical: 1,
  },
  playerCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  playerTitleBox: {
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  playerNameText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  playerSubText: {
    fontSize: 10,
    fontWeight: '700',
  },
  playerAnalysisText: {
    fontSize: Typography.fontSize.xs + 1,
    lineHeight: Typography.lineHeight.sm,
  },
  insightCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  targetBadge: {
    borderRadius: Layout.borderRadius.xs,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 2,
  },
  targetBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  insightTeamName: {
    fontSize: 10,
    fontWeight: '700',
  },
  insightBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: Layout.spacing.sm,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: Typography.fontSize.xs + 1,
    lineHeight: Typography.lineHeight.sm,
  },
});
