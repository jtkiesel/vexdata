import React, { Component, Fragment } from 'react';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import vex from '../vex';
import './Team.scss';
import { ListItemMeta } from '@material/react-list';

type TeamEventProps = {
  team: string,
  sku: string,
  name: string,
  divisions: DivisionMap | undefined
};

type TeamEventState = {
  ranking: VexRanking,
  matchesOpen: boolean,
  matches: VexMatch[],
  awardsOpen: boolean,
  awards: VexAward[]
};

type DivisionMap = {
  [key: number]: string
};

type VexRanking = {
  _id: {
    event: string,
    division: number,
    team: {
      id: string,
      program: number,
      season: number
    }
  },
  rank: number,
  wins: number | undefined,
  losses: number | undefined,
  ties: number | undefined,
  wp: number | undefined,
  ap: number | undefined,
  sp: number | undefined,
  played: number,
  winPct: number | undefined,
  avgScore: number | undefined,
  totalScore: number | undefined,
  highScore: number | undefined
};

type VexMatch = {
  _id: {
    event: string,
    division: number,
    round: number,
    instance: number,
    number: number
  },
  season: number,
  program: number,
  scheduled: Date | undefined,
  started: Date | undefined,
  red: string[],
  blue: string[],
  redSit: string,
  blueSit: string
  redScore: number,
  blueScore: number
};

type VexAward = {
  _id: {
    event: string,
    index: number
  },
  name: string,
  division: string,
  team: string | undefined
};

const rounds: { [key: number]: string } = {
	1: 'P',
	2: 'Q',
	16: 'RR',
	9: 'R128',
	8: 'R64',
	7: 'R32',
	6: 'R16',
	3: 'QF',
	4: 'SF',
	5: 'F',
	15: 'F'
};

const roundKeys = [1, 2, 16, 9, 8, 7, 6, 3, 4, 5, 15];

const roundIndex = (round: number) => roundKeys.indexOf(round);

const decodeRound = (round: number) => rounds[round];

const matchCompare = (a: VexMatch, b: VexMatch) => {
	const aId = a._id;
	const bId = b._id;
  let sort = aId.division - bId.division;
  if (sort) {
		return sort;
	}
  sort = roundIndex(aId.round) - roundIndex(bId.round);
	if (sort) {
		return sort;
	}
	sort = aId.instance - bId.instance;
	if (sort) {
		return sort;
	}
	return aId.number - bId.number;
};

const getRanking = (ranking: VexRanking) => {
  const { rank, wins, losses, ties, wp, ap, sp } = ranking;
  return rank ? `${rank} (${wins}-${losses}-${ties}) ${wp}/${ap}/${sp}` : '';
};

const getMatchTitle = (match: VexMatch) => {
  const { round, instance, number } = match._id;
  return `${decodeRound(round)}${round < 3 || round > 8 ? '' : ` ${instance}-`}${number}`;
};

class TeamEvent extends Component<TeamEventProps, TeamEventState> {
  state: TeamEventState = {
    ranking: {} as VexRanking,
    matchesOpen: false,
    matches: [] as VexMatch[],
    awardsOpen: false,
    awards: [] as VexAward[]
  };

  componentDidMount() {
    const { team, sku } = this.props;
    vex.callApi(`/api/rankings/${sku}/${team}`)
      .then((ranking: VexRanking) => this.setState({ ranking }))
      .catch(console.error);
    vex.callApi(`/api/matches?event=${sku}&teams=${team}`)
      .then((matches: VexMatch[]) => this.setState({ matches }))
      .catch(console.error);
    vex.callApi(`/api/awards?event=${sku}&teams=${team}`)
      .then((awards: VexAward[]) => this.setState({ awards }))
      .catch(console.error);
  }

  render() {
    return (
      <Fragment>
        <Typography variant="h5">{this.props.name}</Typography>
        <List>
          <ListItem button onClick={() => this.setState(state => ({ matchesOpen: !state.matchesOpen }))}>
            <ListItemText primary="Ranking" />
            <Typography variant="subtitle1"><ListItemMeta meta={getRanking(this.state.ranking)} /></Typography>
          </ListItem>
          <Collapse in={this.state.matchesOpen} timeout="auto" unmountOnExit>
            <table className="matches">
              <tbody>
                {this.state.matches.sort(matchCompare).map(match => {
                  const matchTitle = getMatchTitle(match);
                  const date = match.started || match.scheduled;
                  return (
                    <tr key={`${match._id.division} ${matchTitle}`}>
                      <td>
                        <Typography>{this.props.divisions ? this.props.divisions[match._id.division] : ''}</Typography>
                        <Typography>{matchTitle}</Typography>
                        <Typography color="textSecondary">{date ? new Date(date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}</Typography>
                      </td>
                      <td>
                        <table className="alliances">
                          <tbody>
                            {[{ name: 'red', teams: match.red, score: match.redScore },
                              { name: 'blue', teams: match.blue, score: match.blueScore }].map(alliance => (
                                <tr key={alliance.name}>
                                  {alliance.teams.map(team => (
                                    <td className={`alliance ${alliance.name}-alliance team`} key={team}>
                                      <a href={`/teams/${vex.decodeProgram(match.program).toLowerCase()}/${team.toLowerCase()}`} className="team-link">
                                        <Typography className={team === this.props.team ? 'current-team' : ''}>{team}</Typography>
                                      </a>
                                    </td>
                                  ))}
                                  <td className={`alliance ${alliance.name}-alliance score`}>
                                    <Typography className={alliance.teams.includes(this.props.team) ? 'current-team' : ''}>{alliance.score}</Typography>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Collapse>
          <ListItem button onClick={() => this.setState(state => ({ awardsOpen: !state.awardsOpen }))}>
            <ListItemText primary="Awards" />
            <Typography variant="subtitle1"><ListItemMeta meta={this.state.awards.length.toString()} /></Typography>
          </ListItem>
          <Collapse in={this.state.awardsOpen} timeout="auto" unmountOnExit>
            <List>
              {this.state.awards.sort((a, b) => a._id.index - b._id.index).map(award => {
                const awardTitle = `${award.division} | ${award.name}`;
                return (
                  <ListItem key={`${award._id.event}.${award._id.index}`}>
                    <ListItemText primary={awardTitle} />
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>
      </Fragment>
    );
  }
}

export default TeamEvent;
