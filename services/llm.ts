import { settingsService } from './settings';

export interface TacticalReport {
  narrative: string;
  keyMoments: {
    minute: number;
    title: string;
    description: string;
    tacticalImpact: string;
  }[];
  teamAnalysis: {
    home: { tacticalAssessment: string; strengths: string[]; weaknesses: string[] };
    away: { tacticalAssessment: string; strengths: string[]; weaknesses: string[] };
  };
  standoutPerformances: {
    playerName: string;
    teamName: string;
    role: string;
    ratingAnalysis: string;
  }[];
  actionableInsights: {
    teamName: string;
    target: 'coach' | 'players';
    insight: string;
  }[];
}

// Dynamic Mock Report Generator as high-fidelity fallback when API key is missing
function generateMockReport(match: any): TacticalReport {
  const home = match.homeTeam;
  const away = match.awayTeam;
  const winner = match.winnerId === home.id ? home : (match.winnerId === away.id ? away : null);
  const loser = winner ? (winner.id === home.id ? away : home) : null;

  let narrative = '';
  if (winner) {
    narrative = `A tactically absorbing encounter at the ${match.venue} saw ${winner.name} secure a hard-fought ${winner.score}-${loser.score} victory over ${loser.name}. ${winner.name}'s head coach deployed a highly coordinated pressing system that disrupted ${loser.name}'s build-up play in the middle third. While ${loser.name} showed moments of transition threat, ${winner.name} dominated the key zones, especially in central midfield where possession was recycled with high precision.`;
  } else {
    narrative = `A highly contested stalemate at the ${match.venue} ended in a ${home.score}-${away.score} draw. Both managers set up in disciplined mid-blocks, prioritizing defensive structure and space restriction. The match became a battle of transitions, with ${home.name} utilizing vertical passing lanes while ${away.name} focused on wing overloads. A fair reflection of two tactically organized sides canceling each other out.`;
  }

  // Build key moments from actual match timeline
  const keyMoments = match.timeline.slice(0, 4).map((evt: any) => {
    let title = '';
    let description = '';
    let tacticalImpact = '';

    const team = evt.teamId === home.id ? home : away;
    const opp = evt.teamId === home.id ? away : home;

    if (evt.type === 'goal') {
      title = `Goal - ${evt.playerName} (${team.name})`;
      description = `${evt.playerName} opens the space and finds the back of the net. ${evt.detail || ''}`;
      tacticalImpact = `Forces ${opp.name} to advance their defensive line and commit more midfielders forward, exposing them to counter-attacks.`;
    } else if (evt.type === 'own_goal') {
      title = `Own Goal - ${evt.playerName} (${opp.name})`;
      description = `An unfortunate deflection from ${evt.playerName} puts the ball past the goalkeeper.`;
      tacticalImpact = `Unsettles ${opp.name}'s defensive organization and grants momentum to ${team.name}.`;
    } else if (evt.type === 'red_card') {
      title = `Red Card - ${evt.playerName} (${team.name})`;
      description = `${evt.playerName} is sent off, leaving ${team.name} with 10 players.`;
      tacticalImpact = `Forces ${team.name} into a low defensive block, sacrificing their attacking outlet to protect the point.`;
    } else {
      title = `Booking - ${evt.playerName} (${team.name})`;
      description = `${evt.playerName} receives a yellow card from the referee.`;
      tacticalImpact = `Restricts ${evt.playerName}'s aggression in defensive duels, allowing ${opp.name}'s attackers to run at them.`;
    }

    return {
      minute: evt.minute,
      title,
      description,
      tacticalImpact
    };
  });

  // Default moments if timeline is sparse
  if (keyMoments.length === 0) {
    keyMoments.push({
      minute: 15,
      title: 'Tactical Feeling-Out Phase',
      description: 'Both teams trading possession in midfield with minimal penetration.',
      tacticalImpact: 'Managers instructing wingers to stay wide to test horizontal compactness.'
    });
  }

  // Team analysis strengths & weaknesses based on stats
  const getTeamAnalysis = (team: any, opp: any) => {
    const isWinner = winner && winner.id === team.id;
    const isLoser = loser && loser.id === team.id;

    const assessment = isWinner
      ? `${team.name} showed exceptional spatial awareness and transitional structure. They exploited ${opp.name}'s defensive transitions effectively.`
      : isLoser
      ? `${team.name} struggled to maintain vertical compactness, allowing too much space between the lines for ${opp.name}'s creative midfielders.`
      : `${team.name} maintained a solid block but lacked direct penetration in the final third, relying too heavily on lateral possession.`;

    const strengths = [];
    if (team.stats.passAccuracy > 80) strengths.push('Precision build-up play and passing accuracy');
    if (team.stats.tackles > 15) strengths.push('High-intensity defensive duels and active tackling');
    if (team.stats.possession > 52) strengths.push('Positional control and possession dominance');
    if (strengths.length === 0) strengths.push('Organized defensive recovery lines');
    if (team.stats.shotsOnTarget > 4) strengths.push('Clinical finishing in key scoring areas');

    const weaknesses = [];
    if (team.stats.passAccuracy < 75) weaknesses.push('Unforced turnovers in the build-up phase');
    if (team.stats.saves === 0 && opp.stats.shotsOnTarget > 2) weaknesses.push('Vulnerability to direct shots on target');
    if (team.stats.fouls > 12) weaknesses.push('Discipline issues, gifting dangerous set-pieces');
    if (weaknesses.length === 0) weaknesses.push('Susceptibility to high counter-pressing triggers');

    return {
      tacticalAssessment: assessment,
      strengths,
      weaknesses
    };
  };

  // Standout performances
  const standoutPerformances = match.standoutPlayers.map((sp: any) => {
    let ratingAnalysis = '';
    if (sp.metric === 'Top Scorer') {
      ratingAnalysis = `A masterclass in attacking movement. ${sp.name} registered ${sp.value} goal(s), constantly finding pockets of space behind the opponent's center-backs.`;
    } else if (sp.metric === 'Playmaker') {
      ratingAnalysis = `Pulling the strings in midfield. Dictated the tempo of the match, assisting key sequences and registering crucial final-third passes.`;
    } else if (sp.metric === 'Defensive Wall') {
      ratingAnalysis = `An absolute rock at the back. Put in ${sp.value} critical tackles, winning key duels to shut down any threatening movements.`;
    } else {
      ratingAnalysis = `Outstanding performance between the sticks, registering ${sp.value} key saves and organizing the defensive line during set-pieces.`;
    }

    return {
      playerName: sp.name,
      teamName: sp.teamName,
      role: sp.metric,
      ratingAnalysis
    };
  });

  if (standoutPerformances.length === 0) {
    standoutPerformances.push({
      playerName: 'Match XI',
      teamName: home.name,
      role: 'Team Effort',
      ratingAnalysis: 'A disciplined collective showing where defensive organization was the standout feature.'
    });
  }

  // Actionable insights
  const actionableInsights = [
    {
      teamName: home.name,
      target: 'coach' as const,
      insight: home.stats.passAccuracy < 80 
        ? 'Incorporate double-pivot drills to offer easier outlet passes during high press phases.' 
        : 'Incorporate wing overloads to drag the opponent block horizontally and open half-spaces.'
    },
    {
      teamName: away.name,
      target: 'players' as const,
      insight: away.stats.fouls > 10
        ? 'Show greater patience in defensive duels; avoid lunging inside the defensive third.'
        : 'Commit to vertical runs immediately upon transition to exploit spaces behind the full-backs.'
    }
  ];

  return {
    narrative,
    keyMoments,
    teamAnalysis: {
      home: getTeamAnalysis(home, away),
      away: getTeamAnalysis(away, home)
    },
    standoutPerformances,
    actionableInsights
  };
}

export const llmService = {
  generateTacticalReport: async (match: any): Promise<TacticalReport> => {
    const apiKey = await settingsService.getApiKey();

    if (!apiKey) {
      console.log('Gemini API key not found. Using local tactical simulator.');
      // Return dynamic simulated fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateMockReport(match));
        }, 1200); // Simulate network delay for UI loading feel
      });
    }

    console.log(`Calling Gemini API to analyze match ID: ${match.id}`);
    const home = match.homeTeam;
    const away = match.awayTeam;

    const timelineStr = JSON.stringify(
      match.timeline.map((t: any) => ({
        minute: t.minute,
        type: t.type,
        player: t.playerName,
        detail: t.detail || ''
      }))
    );

    const standoutStr = JSON.stringify(
      match.standoutPlayers.map((p: any) => ({
        name: p.name,
        team: p.teamName,
        metric: p.metric,
        value: p.value
      }))
    );

    const prompt = `You are a passionate, tactically brilliant football coach. Write a detailed tactical match report based on the following stats and events:
Match: ${home.name} vs ${away.name} (Stage: ${match.stage})
Final Score: ${home.name} ${home.score} - ${away.name} ${away.score}
Duration: ${match.duration}
Venue: ${match.venue}
Date: ${match.date}

Team Stats:
- ${home.name}: Possession ${home.stats.possession}%, Pass Accuracy ${home.stats.passAccuracy}%, Shots ${home.stats.shotsOnTarget}/${home.stats.shotsTotal}, Fouls ${home.stats.fouls}, Corners ${home.stats.corners}, Clearances ${home.stats.clearances}, Saves ${home.stats.saves}, Tackles ${home.stats.tackles}
- ${away.name}: Possession ${away.stats.possession}%, Pass Accuracy ${away.stats.passAccuracy}%, Shots ${away.stats.shotsOnTarget}/${away.stats.shotsTotal}, Fouls ${away.stats.fouls}, Corners ${away.stats.corners}, Clearances ${away.stats.clearances}, Saves ${away.stats.saves}, Tackles ${away.stats.tackles}

Timeline of Events:
${timelineStr}

Standout Match Performers:
${standoutStr}

Your analysis must:
1. Provide a narrative highlighting key tactical maneuvers, defensive structures (e.g. low-block, mid-block, high-press), and how the goals were conceded/scored.
2. Outline key turning moments with their tactical impact on the match flow.
3. Break down team-specific strengths and weaknesses.
4. Highlight standout player ratings with coach analysis.
5. Provide actionable insights directed to the coach or players.

Format your output EXACTLY according to the JSON schema.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            narrative: { type: 'STRING' },
            keyMoments: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  minute: { type: 'INTEGER' },
                  title: { type: 'STRING' },
                  description: { type: 'STRING' },
                  tacticalImpact: { type: 'STRING' }
                },
                required: ['minute', 'title', 'description', 'tacticalImpact']
              }
            },
            teamAnalysis: {
              type: 'OBJECT',
              properties: {
                home: {
                  type: 'OBJECT',
                  properties: {
                    tacticalAssessment: { type: 'STRING' },
                    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } }
                  },
                  required: ['tacticalAssessment', 'strengths', 'weaknesses']
                },
                away: {
                  type: 'OBJECT',
                  properties: {
                    tacticalAssessment: { type: 'STRING' },
                    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                    weaknesses: { type: 'ARRAY', items: { type: 'STRING' } }
                  },
                  required: ['tacticalAssessment', 'strengths', 'weaknesses']
                }
              },
              required: ['home', 'away']
            },
            standoutPerformances: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  playerName: { type: 'STRING' },
                  teamName: { type: 'STRING' },
                  role: { type: 'STRING' },
                  ratingAnalysis: { type: 'STRING' }
                },
                required: ['playerName', 'teamName', 'role', 'ratingAnalysis']
              }
            },
            actionableInsights: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  teamName: { type: 'STRING' },
                  target: { type: 'STRING', enum: ['coach', 'players'] },
                  insight: { type: 'STRING' }
                },
                required: ['teamName', 'target', 'insight']
              }
            }
          },
          required: ['narrative', 'keyMoments', 'teamAnalysis', 'standoutPerformances', 'actionableInsights']
        }
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error: ${response.status}`);
      }

      const resData = await response.json();
      const text = resData.candidates[0].content.parts[0].text;
      return JSON.parse(text) as TacticalReport;
    } catch (error) {
      console.error('Error generating report from Gemini, falling back to mock:', error);
      return generateMockReport(match);
    }
  }
};
