import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import { Headline4, Headline1 } from '@material/react-typography';

import vex from '../vex'
import './Teams.scss'

type TeamsState = {
  teams: TeamInfo[]
};

type TeamInfo = {
  _id: {
    prog: number,
    id: string,
    season: number
  },
  name: string,
  org: string,
  city: string,
  region: string,
  country: string,
  grade: number,
  robot: string
};

class Teams extends Component<RouteComponentProps, TeamsState> {
  state: TeamsState = {
    teams: []
  };

  componentDidMount() {
    vex.callApi(`/api/teams?sort=id`).then((teams: TeamInfo[]) => {
      this.setState({teams});
    }).catch(console.error);

    document.title = `Teams - VEX Data`;
  }

  render() {
    return (
      <Fragment>
        <Headline4 className="title">Teams</Headline4>
      </Fragment>
    );
  }
}

export default Teams;
