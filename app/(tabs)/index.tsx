import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import matchesData from '@/data/summarized_matches.json';

// Helper to trigger haptics safely
const triggerHaptic = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore
    }
  }
};

const STAGES = ['All', 'Group Stage', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final'];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');

  // Filter matches based on search query and stage
  const filteredMatches = matchesData.filter((match) => {
    const matchesSearch =
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStage === 'All' || match.stage === selectedStage;

    return matchesSearch && matchesStage;
  });

  const handleMatchPress = (id: number) => {
    triggerHaptic();
    router.push(`/match/${id}` as any);
  };

  const handleStagePress = (stage: string) => {
    triggerHaptic();
    setSelectedStage(stage);
  };

  const renderMatchCard = ({ item }: { item: typeof matchesData[0] }) => {
    const isHomeWinner = item.winnerId === item.homeTeam.id;
    const isAwayWinner = item.winnerId === item.awayTeam.id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
            shadowColor: themeColors.shadow,
          },
        ]}
        onPress={() => handleMatchPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardStage, { color: themeColors.textSecondary }]}>
            {item.stage.toUpperCase()}
          </Text>
          <Text style={[styles.cardDate, { color: themeColors.textSecondary }]}>
            {item.date.split(' at ')[0]}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          {/* Home Team */}
          <View style={styles.teamRow}>
            <Text
              style={[
                styles.teamName,
                { color: themeColors.text },
                isHomeWinner && styles.winnerBold,
              ]}
              numberOfLines={1}
            >
              {item.homeTeam.name}
              {isHomeWinner && (
                <Text style={{ color: Colors[colorScheme].gold }}> ★</Text>
              )}
            </Text>
            <Text
              style={[
                styles.teamScore,
                { color: themeColors.text },
                isHomeWinner && styles.winnerBold,
              ]}
            >
              {item.homeTeam.score}
            </Text>
          </View>

          {/* Away Team */}
          <View style={styles.teamRow}>
            <Text
              style={[
                styles.teamName,
                { color: themeColors.text },
                isAwayWinner && styles.winnerBold,
              ]}
              numberOfLines={1}
            >
              {item.awayTeam.name}
              {isAwayWinner && (
                <Text style={{ color: Colors[colorScheme].gold }}> ★</Text>
              )}
            </Text>
            <Text
              style={[
                styles.teamScore,
                { color: themeColors.text },
                isAwayWinner && styles.winnerBold,
              ]}
            >
              {item.awayTeam.score}
            </Text>
          </View>
        </View>

        {/* Card Footer Details */}
        <View style={[styles.cardFooter, { borderTopColor: themeColors.border }]}>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color={themeColors.textSecondary} />
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {item.venue}
            </Text>
          </View>
          {item.duration !== 'Regular' && (
            <View style={[styles.durationBadge, { backgroundColor: themeColors.border }]}>
              <Text style={[styles.durationText, { color: themeColors.text }]}>
                {item.duration.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={20} color={themeColors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search teams or stadiums..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsWrapper}>
        <FlatList
          data={STAGES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item }) => {
            const isSelected = selectedStage === item;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? Colors[colorScheme].primary : themeColors.card,
                    borderColor: isSelected ? Colors[colorScheme].primary : themeColors.border,
                  },
                ]}
                onPress={() => handleStagePress(item)}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : themeColors.text,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Matches List */}
      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No matches found matching your filters.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Layout.spacing.md,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    height: '100%',
  },
  chipsWrapper: {
    marginVertical: Layout.spacing.sm,
  },
  chipsContainer: {
    paddingHorizontal: Layout.spacing.lg,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm - 2,
    borderRadius: Layout.borderRadius.round,
    marginRight: Layout.spacing.sm,
  },
  chipText: {
    fontSize: Typography.fontSize.xs,
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  card: {
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
  },
  cardStage: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '500',
  },
  scoreContainer: {
    marginBottom: Layout.spacing.md,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamName: {
    fontSize: Typography.fontSize.md,
    fontWeight: '500',
    flex: 1,
  },
  winnerBold: {
    fontWeight: 'bold',
  },
  teamScore: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '500',
    marginLeft: Layout.spacing.md,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: Layout.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerText: {
    fontSize: Typography.fontSize.xs,
    marginLeft: 4,
    flex: 1,
  },
  durationBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
});