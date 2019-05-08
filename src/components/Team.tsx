import React, { Component, Fragment } from 'react';
import { RouteComponentProps } from 'react-router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import List, { ListItem, ListItemText, ListItemMeta } from '@material/react-list';
import { Tab, TabBar } from '@rmwc/tabs';

import TeamEvent from './TeamEvent';
import vex from '../vex';
import './Team.scss';

type TeamParams = {
  program: string,
  id: string
};

type TeamState = {
  seasonIndex: number,
  teams: VexTeam[],
  events: VexEvent[],
  stats: TeamStats
};

type VexTeam = {
  _id: {
    id: string,
    season: number
  },
  program: number,
  name: string | undefined,
  org: string | undefined,
  lat: number,
  lng: number,
  city: string,
  region: string | undefined,
  country: string | undefined,
  grade: number | undefined,
  robot: string | undefined
};

type VexDate = {
  start: Date,
  end: Date,
  venue: string | undefined,
  address: string | undefined,
  city: string | undefined,
  region: string | undefined,
  postcode: string | undefined,
  country: string | undefined
};

type VexEvent = {
  _id: string,
  season: number,
  program: number,
  name: string,
  start: Date,
  end: Date,
  lat: number,
  lng: number,
  email: string | undefined,
  phone: string | undefined,
  webcast: string | undefined,
  type: string | undefined,
  capacity: number | undefined,
  spots: number | undefined,
  price: number | undefined,
  dates: VexDate[] | undefined,
  grade: number | undefined,
  skills: boolean | undefined,
  tsa: boolean | undefined,
  regPerOrg: number | undefined,
  opens: Date | undefined,
  deadline: Date | undefined,
  teams: string[] | undefined,
  divisions: {[key: number]: string} | undefined
};

type TeamStats = {
  opr: number,
  dpr: number,
  ccwm: number
};

class Team extends Component<RouteComponentProps<TeamParams>, TeamState> {
  state: TeamState = {
    seasonIndex: -1,
    teams: [],
    events: [],
    stats: {
      opr: 0,
      dpr: 0,
      ccwm: 0
    }
  };

  getTeam() {
    return this.state.teams[this.state.seasonIndex];
  }

  getTeamTitle() {
    const team = this.state.teams[0];
    return team ? `${vex.decodeProgram(team.program)} ${team._id.id}` : '';
  }

  updateEvents(seasonIndex: number) {
    const {id, season} = this.state.teams[seasonIndex]._id;
    vex.callApi(`/api/events?teams=${id}&season=${season}&sort=-end`).then((events: VexEvent[]) => {
      this.setState({events});
    }).catch(console.error);
  }

  onSeasonActivate(seasonIndex: number) {
    this.updateEvents(seasonIndex);
    this.setState({seasonIndex});
    const search = new URLSearchParams(this.props.location.search);
    search.set('season', vex.decodeSeason(this.state.teams[seasonIndex]._id.season).toLowerCase());
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
    return team ? [team.city, team.region, team.country].filter(value => value && value.length).map((value, index, array) => {
        if (index < array.length - 1) {
          value += ',';
        }
      return (<Fragment key={index}><span>{value}</span> </Fragment>);
    }) : "";
  }

  getGrade() {
    const team = this.getTeam();
    return (team && team.grade) ? vex.decodeGrade(team.grade) : '';
  }

  getRobot() {
    const team = this.getTeam();
    return (team && team.robot) ? team.robot : '';
  }

  componentDidMount() {
    const {program, id} = this.props.match.params;
    vex.callApi(`/api/teams?id=${id}&program=${program}&sort=-season`).then((teams: VexTeam[]) => {
      let season = new URLSearchParams(this.props.location.search).get('season');
      let seasonIndex = 0;
      if (season != null) {
        season = season.toLowerCase();
        const index = teams.findIndex(team => vex.decodeSeason(team._id.season).toLowerCase() === season);
        if (index >= 0) {
          seasonIndex = index;
        }
      }
      this.setState({seasonIndex, teams});
      this.updateEvents(seasonIndex);
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
        <Typography variant="h4" className="team-title">{this.getTeamTitle()}</Typography>
        <TabBar
          activeTabIndex={this.state.seasonIndex}
          onActivate={event => {this.onSeasonActivate(event.detail.index)}}
        >
          {this.state.teams.map((team, index) => (
            <Tab key={team._id.season}>{vex.decodeSeason(team._id.season)}</Tab>
          ))}
        </TabBar>
        <div style={{ padding: 16 }}>
          <Grid container spacing={16}>
            <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" className="card-title">Info</Typography>
                  <List nonInteractive>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="Name" />
                      <ListItemMeta meta={this.getName()} />
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="Organization" />
                      <ListItemMeta meta={this.getOrganization()} />
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="Location" />
                      <ListItemMeta className="location" meta="">{this.getLocation()}</ListItemMeta>
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="Grade" />
                      <ListItemMeta meta={this.getGrade()} />
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="Robot" />
                      <ListItemMeta meta={this.getRobot()} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={8} md={6} lg={4} xl={3}>
              <Card>
                <CardContent>
                  <Typography variant="h5" className="card-title">Stats</Typography>
                  <List nonInteractive>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="OPR" />
                      <ListItemMeta meta={this.state.stats.opr.toFixed(2)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="DPR" />
                      <ListItemMeta meta={this.state.stats.dpr.toFixed(2)} />
                    </ListItem>
                    <ListItem>
                      <ListItemText className="list-item-text" primaryText="CCWM" />
                      <ListItemMeta meta={this.state.stats.ccwm.toFixed(2)} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={16} style={{paddingTop: 8}}>
            {this.state.events.map(event => (
              <Grid item xs={12} sm={8} md={6} lg={4} xl={3} key={event._id}>
                <Card>
                  <CardContent>
                    <TeamEvent
                      team={this.getTeam()._id.id}
                      sku={event._id}
                      name={event.name}
                      divisions={event.divisions}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fragment>
    );
  }
}

export default Team;
