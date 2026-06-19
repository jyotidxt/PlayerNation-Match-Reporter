const fs = require('fs');
const path = require('path');

const MATCHES_PATH = path.join(__dirname, '..', 'data', 'matches', 'matches_World_Cup.json');
const EVENTS_PATH = path.join(__dirname, '..', 'data', 'events_World_Cup.json');
const PLAYERS_PATH = path.join(__dirname, '..', 'data', 'players.json');
const TEAMS_PATH = path.join(__dirname, '..', 'data', 'teams.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'summarized_matches.json');

const STAGE_MAPPING = {
  '4165363': 'Group Stage',
  '4165364': 'Round of 16',
  '4165365': 'Quarter-Finals',
  '4165366': 'Semi-Finals',
  '4165367': 'Third Place Play-off',
  '4165368': 'Final'
};

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function getEventMinute(period, sec) {
  const min = Math.floor(sec / 60) + 1; // 1-indexed minutes (e.g. 0-59s is minute 1)
  if (period === '1H') return Math.min(min, 45); // Cap first half at 45 (stoppage time is shown as 45+)
  if (period === '2H') return 45 + Math.min(min, 45); // Cap second half at 90
  if (period === 'E1') return 90 + Math.min(min, 15);
  if (period === 'E2') return 105 + Math.min(min, 15);
  return min; // Fallback
}

function formatEventSec(period, sec) {
  // Return formatted display minute like "45+2" or "90+1" or just "23"
  const totalMin = Math.floor(sec / 60);
  const minPart = totalMin + 1;
  if (period === '1H') {
    if (minPart > 45) return `45+${minPart - 45}`;
    return `${minPart}`;
  }
  if (period === '2H') {
    if (minPart > 45) return `90+${minPart - 45}`;
    return `${45 + minPart}`;
  }
  if (period === 'E1') {
    if (minPart > 15) return `105+${minPart - 15}`;
    return `${90 + minPart}`;
  }
  if (period === 'E2') {
    if (minPart > 15) return `120+${minPart - 15}`;
    return `${105 + minPart}`;
  }
  return `${minPart}`;
}

async function main() {
  console.log('Loading datasets...');
  const matches = readJsonFile(MATCHES_PATH);
  const events = readJsonFile(EVENTS_PATH);
  const playersList = readJsonFile(PLAYERS_PATH) || [];
  const teamsList = readJsonFile(TEAMS_PATH) || [];

  if (!matches || !events) {
    console.error('Failed to load matches or events data.');
    process.exit(1);
  }

  console.log(`Loaded ${matches.length} matches and ${events.length} events.`);

  // Create lookup maps
  const playersMap = {};
  playersList.forEach(p => {
    playersMap[p.wyId] = p;
  });

  const teamsMap = {};
  teamsList.forEach(t => {
    teamsMap[t.wyId] = t;
  });

  // Group events by matchId
  console.log('Grouping events by match...');
  const eventsByMatch = {};
  events.forEach(e => {
    if (!eventsByMatch[e.matchId]) {
      eventsByMatch[e.matchId] = [];
    }
    eventsByMatch[e.matchId].push(e);
  });

  const summarizedMatches = [];

  console.log('Processing matches...');
  matches.forEach(match => {
    const matchId = match.wyId;
    const matchEvents = eventsByMatch[matchId] || [];

    // Parse team names from label
    // Label format: "France - Croatia, 4 - 2" or "Croatia - England, 2 - 1 (E)"
    const labelParts = match.label.split(',');
    const teamsPart = labelParts[0];
    const teamNames = teamsPart.split(' - ');
    const labelHomeName = teamNames[0].trim();
    const labelAwayName = teamNames[1].trim();

    // Get team IDs and data
    const teamIds = Object.keys(match.teamsData);
    let homeTeamId = null;
    let awayTeamId = null;

    teamIds.forEach(id => {
      if (match.teamsData[id].side === 'home') {
        homeTeamId = parseInt(id);
      } else {
        awayTeamId = parseInt(id);
      }
    });

    const homeTeamData = match.teamsData[homeTeamId];
    const awayTeamData = match.teamsData[awayTeamId];

    const homeTeamName = (teamsMap[homeTeamId] && teamsMap[homeTeamId].name) || labelHomeName;
    const awayTeamName = (teamsMap[awayTeamId] && teamsMap[awayTeamId].name) || labelAwayName;

    // Initialize stats
    const stats = {
      [homeTeamId]: {
        possession: 50,
        passesTotal: 0,
        passesCompleted: 0,
        passAccuracy: 0,
        shotsTotal: 0,
        shotsOnTarget: 0,
        shotsAccuracy: 0,
        goals: homeTeamData.score,
        corners: 0,
        fouls: 0,
        tackles: 0,
        clearances: 0,
        saves: 0,
        yellowCards: 0,
        redCards: 0
      },
      [awayTeamId]: {
        possession: 50,
        passesTotal: 0,
        passesCompleted: 0,
        passAccuracy: 0,
        shotsTotal: 0,
        shotsOnTarget: 0,
        shotsAccuracy: 0,
        goals: awayTeamData.score,
        corners: 0,
        fouls: 0,
        tackles: 0,
        clearances: 0,
        saves: 0,
        yellowCards: 0,
        redCards: 0
      }
    };

    // Track player stats for this match
    const playerStats = {};

    function initPlayer(playerId, teamId) {
      if (!playerStats[playerId]) {
        const playerObj = playersMap[playerId];
        const name = playerObj ? `${playerObj.firstName} ${playerObj.lastName}` : `Player #${playerId}`;
        const shortName = playerObj ? playerObj.shortName : `P. #${playerId}`;
        const role = (playerObj && playerObj.role && playerObj.role.name) || 'Player';

        playerStats[playerId] = {
          id: playerId,
          name: name,
          shortName: shortName,
          teamId: teamId,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          shots: 0,
          keyPasses: 0,
          tackles: 0,
          saves: 0,
          role: role
        };
      }
      return playerStats[playerId];
    }

    // Initialize players from formation lineup and bench
    [homeTeamId, awayTeamId].forEach(tId => {
      const tData = match.teamsData[tId];
      if (tData.formation) {
        tData.formation.lineup.forEach(p => initPlayer(p.playerId, tId));
        tData.formation.bench.forEach(p => initPlayer(p.playerId, tId));
      }
    });

    const timelineEvents = [];

    // 1. Parse goals from events
    matchEvents.forEach(e => {
      const teamId = e.teamId;
      const playerId = e.playerId;
      const tags = e.tags.map(t => t.id);

      // Verify if player belongs to stats
      if (playerId && (teamId === homeTeamId || teamId === awayTeamId)) {
        initPlayer(playerId, teamId);
      }

      // Goal (tag 101) or Own Goal (tag 102)
      if (tags.includes(101) || tags.includes(102)) {
        const isOwnGoal = tags.includes(102);
        const goalTeamId = isOwnGoal ? (teamId === homeTeamId ? awayTeamId : homeTeamId) : teamId;
        const displayMin = formatEventSec(e.matchPeriod, e.eventSec);
        const minVal = getEventMinute(e.matchPeriod, e.eventSec);

        const playerObj = playerStats[playerId];
        const playerName = playerObj ? playerObj.name : `Player #${playerId}`;

        // Find assist player if any
        let assistPlayerName = '';
        if (!isOwnGoal) {
          // Look for an assist tag in events near this event time
          // Or search for the assist tag in metadata lineup/bench assists later
          if (playerObj) {
            playerObj.goals += 1;
          }
        }

        timelineEvents.push({
          type: isOwnGoal ? 'own_goal' : 'goal',
          minute: minVal,
          displayMinute: displayMin,
          teamId: goalTeamId,
          playerName: playerName,
          detail: isOwnGoal ? 'Own goal' : ''
        });
      }

      // Passes
      if (e.eventName === 'Pass') {
        if (stats[teamId]) {
          stats[teamId].passesTotal += 1;
          const isAccurate = tags.includes(1801);
          if (isAccurate) {
            stats[teamId].passesCompleted += 1;
          }
          if (tags.includes(302)) {
            // Key pass
            const pObj = playerStats[playerId];
            if (pObj) pObj.keyPasses += 1;
          }
        }
      }

      // Shots
      if (e.eventName === 'Shot' || e.subEventName === 'Free kick shot') {
        if (stats[teamId]) {
          stats[teamId].shotsTotal += 1;
          const isOnTarget = tags.includes(1801) || tags.includes(101);
          if (isOnTarget) {
            stats[teamId].shotsOnTarget += 1;
          }
          const pObj = playerStats[playerId];
          if (pObj) pObj.shots += 1;
        }
      }

      // Fouls
      if (e.eventName === 'Foul') {
        if (stats[teamId]) {
          stats[teamId].fouls += 1;
        }
      }

      // Corners
      if (e.subEventName === 'Corner') {
        if (stats[teamId]) {
          stats[teamId].corners += 1;
        }
      }

      // Clearances
      if (e.subEventName === 'Clearance') {
        if (stats[teamId]) {
          stats[teamId].clearances += 1;
        }
      }

      // Tackles (defending duels, sliding tackle)
      if (
        e.subEventName === 'Ground defending duel' ||
        tags.includes(1601) // Sliding tackle
      ) {
        if (stats[teamId]) {
          stats[teamId].tackles += 1;
          const pObj = playerStats[playerId];
          if (pObj) pObj.tackles += 1;
        }
      }

      // Saves (Save attempt, reflexes)
      if (e.eventName === 'Save attempt' || e.subEventName === 'Reflexes') {
        if (stats[teamId]) {
          stats[teamId].saves += 1;
          const pObj = playerStats[playerId];
          if (pObj) pObj.saves += 1;
        }
      }
    });

    // 2. Parse substitutions from match metadata
    [homeTeamId, awayTeamId].forEach(tId => {
      const tData = match.teamsData[tId];
      if (tData.formation && tData.formation.substitutions) {
        tData.formation.substitutions.forEach(sub => {
          const playerOutId = sub.playerOut;
          const playerInId = sub.playerIn;
          const minute = sub.minute;

          const playerOutObj = initPlayer(playerOutId, tId);
          const playerInObj = initPlayer(playerInId, tId);

          timelineEvents.push({
            type: 'substitution',
            minute: minute,
            displayMinute: `${minute}`,
            teamId: tId,
            playerName: playerInObj.name,
            detail: `Subbed out: ${playerOutObj.name}`
          });
        });
      }
    });

    // 3. Parse cards from match metadata lineup/bench details
    [homeTeamId, awayTeamId].forEach(tId => {
      const tData = match.teamsData[tId];
      if (tData.formation) {
        const processPlayerCards = (p) => {
          const pId = p.playerId;
          const pObj = initPlayer(pId, tId);

          // Assists
          const assistsVal = parseInt(p.assists);
          if (!isNaN(assistsVal) && assistsVal > 0) {
            pObj.assists = assistsVal;
          }

          // Yellow card
          const yellowVal = p.yellowCards;
          if (yellowVal && yellowVal !== 'null' && yellowVal !== '0') {
            const min = parseInt(yellowVal);
            pObj.yellowCards = 1;
            stats[tId].yellowCards += 1;
            timelineEvents.push({
              type: 'yellow_card',
              minute: min,
              displayMinute: `${min}`,
              teamId: tId,
              playerName: pObj.name
            });
          }

          // Red card
          const redVal = p.redCards;
          if (redVal && redVal !== 'null' && redVal !== '0') {
            const min = parseInt(redVal);
            pObj.redCards = 1;
            stats[tId].redCards += 1;
            timelineEvents.push({
              type: 'red_card',
              minute: min,
              displayMinute: `${min}`,
              teamId: tId,
              playerName: pObj.name
            });
          }
        };

        tData.formation.lineup.forEach(processPlayerCards);
        tData.formation.bench.forEach(processPlayerCards);
      }
    });

    // Cross-reference assists to add details to goal timeline events
    // Let's match goals with scorers and assists if possible
    timelineEvents.forEach(evt => {
      if (evt.type === 'goal' && !evt.detail) {
        // Find if another player in the same team has assists and check who it might be
        const teamAssisters = Object.values(playerStats).filter(
          p => p.teamId === evt.teamId && p.assists > 0
        );
        if (teamAssisters.length === 1) {
          evt.detail = `Assist by ${teamAssisters[0].name}`;
        } else if (teamAssisters.length > 1) {
          // If multiple, just pick the first one and decrement or list
          const assister = teamAssisters[0];
          evt.detail = `Assist by ${assister.name}`;
        }
      }
    });

    // Sort timeline chronologically
    timelineEvents.sort((a, b) => a.minute - b.minute);

    // Calculate pass accuracy and possession
    const homePassesCompleted = stats[homeTeamId].passesCompleted;
    const awayPassesCompleted = stats[awayTeamId].passesCompleted;
    const totalCompleted = homePassesCompleted + awayPassesCompleted;

    if (totalCompleted > 0) {
      stats[homeTeamId].possession = Math.round((homePassesCompleted / totalCompleted) * 100);
      stats[awayTeamId].possession = 100 - stats[homeTeamId].possession;
    }

    [homeTeamId, awayTeamId].forEach(tId => {
      if (stats[tId].passesTotal > 0) {
        stats[tId].passAccuracy = parseFloat(
          ((stats[tId].passesCompleted / stats[tId].passesTotal) * 100).toFixed(1)
        );
      }
      if (stats[tId].shotsTotal > 0) {
        stats[tId].shotsAccuracy = parseFloat(
          ((stats[tId].shotsOnTarget / stats[tId].shotsTotal) * 100).toFixed(1)
        );
      }
    });

    // Map lineup and bench to full info
    const homeLineup = homeTeamData.formation
      ? homeTeamData.formation.lineup.map(p => playerStats[p.playerId])
      : [];
    const homeBench = homeTeamData.formation
      ? homeTeamData.formation.bench.map(p => playerStats[p.playerId])
      : [];

    const awayLineup = awayTeamData.formation
      ? awayTeamData.formation.lineup.map(p => playerStats[p.playerId])
      : [];
    const awayBench = awayTeamData.formation
      ? awayTeamData.formation.bench.map(p => playerStats[p.playerId])
      : [];

    // Calculate standout players
    const standoutPlayers = [];
    const allPlayers = Object.values(playerStats);

    // 1. Top scorer (most goals)
    const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals);
    if (topScorers[0] && topScorers[0].goals > 0) {
      const teamName = topScorers[0].teamId === homeTeamId ? homeTeamName : awayTeamName;
      standoutPlayers.push({
        id: topScorers[0].id,
        name: topScorers[0].name,
        teamName: teamName,
        metric: 'Top Scorer',
        value: topScorers[0].goals
      });
    }

    // 2. Playmaker (most assists / key passes)
    const topPlaymakers = [...allPlayers].sort((a, b) => (b.assists * 3 + b.keyPasses) - (a.assists * 3 + a.keyPasses));
    if (topPlaymakers[0] && (topPlaymakers[0].assists > 0 || topPlaymakers[0].keyPasses > 0)) {
      const teamName = topPlaymakers[0].teamId === homeTeamId ? homeTeamName : awayTeamName;
      standoutPlayers.push({
        id: topPlaymakers[0].id,
        name: topPlaymakers[0].name,
        teamName: teamName,
        metric: 'Playmaker',
        value: topPlaymakers[0].assists || topPlaymakers[0].keyPasses
      });
    }

    // 3. Defensive Wall (most tackles)
    const topDefenders = [...allPlayers].filter(p => p.role !== 'Goalkeeper').sort((a, b) => b.tackles - a.tackles);
    if (topDefenders[0] && topDefenders[0].tackles > 0) {
      const teamName = topDefenders[0].teamId === homeTeamId ? homeTeamName : awayTeamName;
      standoutPlayers.push({
        id: topDefenders[0].id,
        name: topDefenders[0].name,
        teamName: teamName,
        metric: 'Defensive Wall',
        value: topDefenders[0].tackles
      });
    }

    // 4. Shot Stopper (most saves)
    const topGoalkeepers = [...allPlayers].filter(p => p.role === 'Goalkeeper').sort((a, b) => b.saves - a.saves);
    if (topGoalkeepers[0] && topGoalkeepers[0].saves > 0) {
      const teamName = topGoalkeepers[0].teamId === homeTeamId ? homeTeamName : awayTeamName;
      standoutPlayers.push({
        id: topGoalkeepers[0].id,
        name: topGoalkeepers[0].name,
        teamName: teamName,
        metric: 'Shot Stopper',
        value: topGoalkeepers[0].saves
      });
    }

    // Build the final summarized match object
    summarizedMatches.push({
      id: matchId,
      label: match.label,
      date: match.date,
      dateutc: match.dateutc,
      venue: match.venue,
      stage: STAGE_MAPPING[match.roundId] || 'Group Stage',
      duration: match.duration,
      winnerId: match.winner ? parseInt(match.winner) : null,
      homeTeam: {
        id: homeTeamId,
        name: homeTeamName,
        score: homeTeamData.score,
        scoreHT: homeTeamData.scoreHT,
        scoreET: homeTeamData.scoreET || 0,
        scoreP: homeTeamData.scoreP || 0,
        coach: playersMap[homeTeamData.coachId]
          ? `${playersMap[homeTeamData.coachId].firstName} ${playersMap[homeTeamData.coachId].lastName}`
          : 'Unknown Coach',
        stats: stats[homeTeamId],
        lineup: homeLineup,
        bench: homeBench
      },
      awayTeam: {
        id: awayTeamId,
        name: awayTeamName,
        score: awayTeamData.score,
        scoreHT: awayTeamData.scoreHT,
        scoreET: awayTeamData.scoreET || 0,
        scoreP: awayTeamData.scoreP || 0,
        coach: playersMap[awayTeamData.coachId]
          ? `${playersMap[awayTeamData.coachId].firstName} ${playersMap[awayTeamData.coachId].lastName}`
          : 'Unknown Coach',
        stats: stats[awayTeamId],
        lineup: awayLineup,
        bench: awayBench
      },
      timeline: timelineEvents,
      standoutPlayers: standoutPlayers
    });
  });

  console.log(`Writing summarized matches to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(summarizedMatches, null, 2), 'utf8');
  console.log('Preprocessing completed successfully!');
}

main();
