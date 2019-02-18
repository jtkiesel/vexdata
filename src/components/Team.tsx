import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import Card from '@material/react-card';
import { Grid, Row, Cell } from '@material/react-layout-grid';
import List, { ListItem, ListItemText, ListDivider, ListItemMeta } from '@material/react-list';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import { Headline4, Headline1 } from '@material/react-typography';

import '@material/react-card/index.scss';
import '@material/react-layout-grid/index.scss';
import '@material/react-list/index.scss';
import '@material/react-tab/index.scss';
import '@material/react-tab-bar/index.scss';
import '@material/react-tab-indicator/index.scss';
import '@material/react-tab-scroller/index.scss';
import '@material/react-typography/index.scss';

import './Team.scss';

type TeamParams = {
  program: string,
  id: string
};

type TeamState = {
  seasonIndex: number,
  seasons: TeamInfo[],
  stats: TeamStats
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
}

type TeamStats = {
  opr: number,
  dpr: number,
  ccwm: number
}

const programs: {[key: number]: string} = {
  1: 'VRC',
  4: 'VEXU',
  41: 'VIQC'
};

const seasons: {[key: number]: string} = {
  '-4': 'Bridge Battle',
	'-3': 'Elevation',
	'-2': 'Elevation',
	'-1': 'Rings-n-Things',
	'1': 'Clean Sweep',
	'4': 'Clean Sweep',
	'7': 'Round Up',
	'10': 'Round Up',
	'73': 'Gateway',
	'76': 'Gateway',
	'85': 'Sack Attack',
	'88': 'Sack Attack',
	'92': 'Toss Up',
	'93': 'Toss Up',
	'96': 'Add It Up',
	'101': 'Highrise',
	'102': 'Skyrise',
	'103': 'Skyrise',
	'109': 'Bank Shot',
	'110': 'Nothing But Net',
	'111': 'Nothing But Net',
	'114': 'Crossover',
	'115': 'Starstruck',
	'116': 'Starstruck',
	'119': 'In the Zone',
	'120': 'In the Zone',
	'121': 'Ringmaster',
	'124': 'Next Level',
	'125': 'Turning Point',
	'126': 'Turning Point'
};

const grades = [
  'All',
  'Elementary',
  'Middle School',
  'High School',
  'College'
];

const decodeProgram = (id: number) => programs[id];
const decodeSeason = (id: number) => seasons[id];
const decodeGrade = (id: number) => grades[id];

const callApi = (input: RequestInfo, init?: RequestInit | undefined) => {
  return fetch(input, init).then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }).then(response => {
    return response.json();
  });
}

class Team extends Component<RouteComponentProps<TeamParams>, TeamState> {
  state: TeamState = {
    seasonIndex: 0,
    seasons: [],
    stats: {
      opr: 0,
      dpr: 0,
      ccwm: 0
    }
  };

  getTeam() {
    return this.state.seasons[this.state.seasonIndex];
  }

  getTeamTitle() {
    const team = this.state.seasons[0];
    return team ? `${decodeProgram(team._id.prog)} ${team._id.id}` : '';
  }

  handleSeasonIndexUpdate(seasonIndex: number) {
    this.setState({seasonIndex});
    const search = new URLSearchParams(this.props.location.search);
    search.set('season', decodeSeason(this.state.seasons[seasonIndex]._id.season).toLowerCase());
    this.props.history.replace({search: search.toString()});
  }

  getName() {
    const team = this.getTeam();
    return (team && team.name) ? team.name : '';
  }

  getOrganization() {
    const team = this.getTeam();
    return (team && team.org) ? team.org : '';
  }

  getLocation() {
    const team = this.getTeam();
    return team ? [team.city, team.region, team.country].filter(value => value && value.length).join(', ') : '';
  }

  getGrade() {
    const team = this.getTeam();
    return (team && team.grade) ? decodeGrade(team.grade) : '';
  }

  getRobot() {
    const team = this.getTeam();
    return (team && team.robot) ? team.robot : '';
  }

  componentDidMount() {
    const {program, id} = this.props.match.params;
    callApi(`/api/teams?id=${id}&program=${program}&sort=-season`).then((seasons: TeamInfo[]) => {
      let season = new URLSearchParams(this.props.location.search).get('season');
      let seasonIndex = 0;
      if (season != null) {
        season = season.toLowerCase();
        const index = seasons.findIndex(team => decodeSeason(team._id.season).toLowerCase() === season);
        if (index >= 0) {
          seasonIndex = index;
        }
      }
      this.setState({seasonIndex, seasons});
      document.title = `${this.getTeamTitle()} - VEX Data`;
    }).catch(console.error);
    /*callApi(`/api/program/${program}/team/${id}/stats`).then(team => {
      const opr = team.opr || 0;
      const dpr = team.dpr || 0;
      const ccwm = team.ccwm || 0;
      this.setState({opr, dpr, ccwm});
    }).catch(console.error);*/
  }

  render() {
    return (
      <Fragment>
        <Headline4 className="team-title">{this.getTeamTitle()}</Headline4>
        <TabBar
          activeIndex={this.state.seasonIndex}
          handleActiveIndexUpdate={activeIndex => this.handleSeasonIndexUpdate(activeIndex)}
        >
          {this.state.seasons.map((team, index) => (
            <Tab
              active={this.state.seasonIndex === index}
              key={team._id.season}
            >
              <span className="mdc-tab__text-label">{decodeSeason(team._id.season)}</span>
            </Tab>
          ))}
        </TabBar>
        <Grid>
          <Row>
            <Cell columns={6}>
              <Card>
                <Headline1 className="card-title">Info</Headline1>
                <List nonInteractive>
                  <ListDivider />
                  <ListItem>
                    <ListItemText primaryText="Name" />
                    <ListItemMeta meta={this.getName()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="Organization" />
                    <ListItemMeta meta={this.getOrganization()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="Location" />
                    <ListItemMeta meta={this.getLocation()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="Grade" />
                    <ListItemMeta meta={this.getGrade()} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="Robot" />
                    <ListItemMeta meta={this.getRobot()} />
                  </ListItem>
                </List>
              </Card>
            </Cell>
            <Cell columns={6}>
              <Card>
                <Headline1 className="card-title">Stats</Headline1>
                <List nonInteractive>
                  <ListDivider />
                  <ListItem>
                    <ListItemText primaryText="OPR" />
                    <ListItemMeta meta={this.state.stats.opr.toFixed(2)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="DPR" />
                    <ListItemMeta meta={this.state.stats.dpr.toFixed(2)} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primaryText="CCWM" />
                    <ListItemMeta meta={this.state.stats.ccwm.toFixed(2)} />
                  </ListItem>
                </List>
              </Card>
            </Cell>
          </Row>
        </Grid>
      </Fragment>
    );
  }
}

export default Team;
