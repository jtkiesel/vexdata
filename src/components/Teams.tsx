import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import vex from '../vex'
import './Teams.scss'

type TeamsState = {
  rankings: VexRanking[]
};

type VexRanking = {
  _id: {
    event: string,
    division: number,
    rank: number
  },
  team: {
    id: string,
    program: number,
    season: number
  },
  played: number,
  wins: number | undefined,
  losses: number | undefined,
  ties: number | undefined,
  wp: number | undefined,
  ap: number | undefined,
  sp: number | undefined,
  winPct: number | undefined,
  avgScore: number | undefined,
  totalScore: number | undefined,
  highScore: number | undefined,
  opr: number | undefined,
  dpr: number | undefined,
  ccwm: number | undefined
};

class Teams extends Component<RouteComponentProps, TeamsState> {
  state: TeamsState = {
    rankings: []
  };

  getRankings(skip: number = 0) {
    vex.callApi(`/api/rankings?season=tower takeover&sort=-opr&skip=${skip}`).then((teams: VexRanking[]) => {
      this.setState({ rankings: teams });
    }).catch(console.error);
  }

  componentDidMount() {
    this.getRankings();
    document.title = `Teams - VEX Data`;
  }

  render() {
    return (
      <Fragment>
        <Typography variant="h4" className="title">Teams</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>OPR</TableCell>
                <TableCell>DPR</TableCell>
                <TableCell>CCWM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.rankings.map((ranking: VexRanking, index: number) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{ranking.team.id}</TableCell>
                    <TableCell>{(ranking.opr || 0).toFixed(2)}</TableCell>
                    <TableCell>{(ranking.dpr || 0).toFixed(2)}</TableCell>
                    <TableCell>{(ranking.ccwm || 0).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Fragment>
    );
  }
}

export default Teams;
