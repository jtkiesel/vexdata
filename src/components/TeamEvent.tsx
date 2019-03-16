import React, { Component, Fragment } from 'react';
import List, { ListItem, ListItemText, ListDivider, ListItemMeta } from '@material/react-list';
import { Body1, Body2, Headline5 } from '@material/react-typography';

import vex from '../vex';
import './Team.scss';

type TeamEventProps = {
  team: string,
  sku: string,
  name: string,
  divisions: DivisionMap | undefined
};

type TeamEventState = {
  matches: VexMatch[]
};

type DivisionMap = {
  [key: number]: string
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

const rounds: {[key: number]: string} = {
	1: 'P',
	2: 'Q',
	9: 'R128',
	8: 'R64',
	7: 'R32',
	6: 'R16',
	3: 'QF',
	4: 'SF',
	5: 'F',
	15: 'F'
};

const decodeRound = (round: number) => rounds[round];

const getMatchTitle = (match: VexMatch, divisions: DivisionMap | undefined) => {
  const {division, round, instance, number} = match._id;
  return `${divisions ? `${divisions[division]} ` : ''}${decodeRound(round)}${round < 3 || round > 8 ? '' : ` ${instance}-`}${number}`;
};

class TeamEvent extends Component<TeamEventProps, TeamEventState> {
  state: TeamEventState = {
    matches: [] as VexMatch[]
  };

  componentDidMount() {
    const {team, sku} = this.props;
    vex.callApi(`/api/matches?event=${sku}&teams=${team}`).then((matches: VexMatch[]) => {
      this.setState({matches});
    }).catch(console.error);
  }

  render() {
    return (
      <Fragment>
        <Headline5 className="card-title">{this.props.name}</Headline5>
        <table>
          <tbody>
            {this.state.matches.map(match => {
              const matchTitle = getMatchTitle(match, this.props.divisions);
              return (
                <tr key={matchTitle}>
                  <td>
                    <Body1>{matchTitle}</Body1>
                    <Body1>{match.started ? new Date(match.started).toLocaleString() : ''}</Body1>
                  </td>
                  <td>
                    <table>
                      <tbody>
                        {[{name: 'red', teams: match.red, score: match.redScore},
                          {name: 'blue', teams: match.blue, score: match.blueScore}].map(alliance => (
                            <tr key={alliance.name}>
                              {alliance.teams.map(team => (
                                <td key={team}>
                                  <Body1>{team}</Body1>
                                </td>
                              ))}
                              <td>
                                <Body1>{alliance.score}</Body1>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <List>
          {this.state.matches.map(match => {
            const matchTitle = getMatchTitle(match, this.props.divisions);
            return (
              <ListItem key={matchTitle}>
                <ListItemText className="list-item-text" primaryText={matchTitle} />
                <ListItemMeta meta="">12A 34B 5<br />
                67C 89D 0</ListItemMeta>
              </ListItem>
            );
          })}
        </List>
      </Fragment>
    );
  }
}

export default TeamEvent;
