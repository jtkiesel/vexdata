import React, { Component, FocusEvent, Fragment, MouseEvent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import axios, { CancelTokenSource } from 'axios';
import { AppBar, Drawer, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, InputBase, TextField, SvgIcon } from '@material-ui/core';
import { Event, FormatListNumbered, Menu, RecentActors, Search } from '@material-ui/icons';

import vex from '../vex';
import './App.scss';

type AppState = {
  navigationOpen: boolean,
  searchOpen: boolean,
  teams: VexTeam[],
  searchToken: CancelTokenSource | undefined,
  searchCache: { [key: string]: VexTeam[] }
};

type VexTeam = {
  _id: {
    program: number,
    id: string,
    season: number
  },
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

const ProgramIcon = (props: { program: number }) => {
  if (!props.program) {
    return null;
  }
  switch (props.program) {
    case 4: return (
      <SvgIcon viewBox="0 0 24 24">
        <path fill="none" d="M0,0h24v24H0V0z"/>
        <path fill="#F44336" d="M21.3,0H2.7C1.2,0,0,1.2,0,2.7v18.7C0,22.8,1.2,24,2.7,24h18.7c1.5,0,2.7-1.2,2.7-2.7V2.7C24,1.2,22.8,0,21.3,0z"/>
        <path fill="#FFFFFF" d="M15,13.1c0,1.6-1.3,3-3,3s-3-1.3-3-3V4H5.1v9.1c0,3.8,3,6.9,6.9,6.9s6.9-3,6.9-6.9V4H15V13.1z"/>
      </SvgIcon>
    );
    case 41: return (
      <SvgIcon viewBox="0 0 24 24">
        <path fill="none" d="M0,0h24v24H0V0z"/>
        <path fill="#2196F3" d="M21.2,0H2.7C1.2,0,0,1.2,0,2.7v18.7C0,22.8,1.2,24,2.7,24h18.6c1.5,0,2.7-1.2,2.7-2.7V2.7C23.9,1.2,22.7,0,21.2,0z M13.8,20h-4L5.3,4h4l2.7,9.1L14.6,4h4L13.8,20z"/>
      </SvgIcon>
    );
    default: return (
      <SvgIcon viewBox="0 0 24 24">
        <path fill="none" d="M0,0h24v24H0V0z"/>
        <path fill="#F44336" d="M21.3,0H2.7C1.2,0,0,1.2,0,2.7v18.7C0,22.8,1.2,24,2.7,24h18.7c1.5,0,2.7-1.2,2.7-2.7V2.7C24,1.2,22.8,0,21.3,0z M13.9,20h-4L5.3,4h4l2.7,9.1L14.7,4h4L13.9,20z"/>
      </SvgIcon>
    );
  }
};

class App extends Component<RouteComponentProps, AppState> {
  state: AppState = {
    navigationOpen: false,
    searchOpen: false,
    teams: [] as VexTeam[],
    searchToken: undefined,
    searchCache: {}
  };

  isSelected(path: string) {
    return this.props.location.pathname === path;
  }

  getColor(path: string) {
    return this.isSelected(path) ? 'primary' : 'action';
  }

  onNavigationIconClick() {
    this.setState(state => ({ navigationOpen: !state.navigationOpen }));
  }

  onSearchFocus(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    this.setState({ searchOpen: true });
    event.target.blur();
  }

  onNavigationItemClick(event: MouseEvent, path: string) {
    this.props.history.push(path);
    this.setState({ navigationOpen: false });
    event.preventDefault();
  }

  onSearchChange(search: string) {
    if (this.state.searchToken) {
      this.state.searchToken.cancel();
    }
    if (search) {
      const cached = this.state.searchCache[search];
      if (cached) {
        this.setState({ teams: cached });
        return;
      }
      const searchToken = axios.CancelToken.source();
      this.setState({searchToken});
      vex.callApi(`/api/teams?search=${search}&sort=id,-season&limit=10`, { cancelToken: searchToken.token })
        .then((teams: VexTeam[]) => this.setState(state => {
          state.searchCache[search] = teams;
          return { teams, searchCache: state.searchCache };
        })).catch(error => {
          if (!axios.isCancel(error)) {
            console.error(error);
          }
        });
    } else {
      this.setState({ teams: [] });
    }
  }

  render() {
    const toolbarItems = (
      <Fragment>
        <Menu
          className="menu-icon"
          color="inherit"
          aria-label="Open Drawer"
          onClick={() => this.onNavigationIconClick()}
        />
        <Typography
          className="title"
          variant="h6"
          color="inherit"
          noWrap
        >
          VEX Data
        </Typography>
      </Fragment>
    );

    return (
      <div>
        <AppBar position="static">
          <Toolbar disableGutters variant="dense">
            {toolbarItems}
            <div className="search-bar">
              <InputBase
                className="search-input"
                placeholder="Search"
                onFocus={event => this.onSearchFocus(event)}
              />
              <Search
                className="search-icon"
                onClick={() => this.setState({ searchOpen: true })}
              />
            </div>
            <div className="search-button">
              <Search onClick={() => this.setState({ searchOpen: true })} />
            </div>
          </Toolbar>
        </AppBar>
        {this.props.children}
        <Drawer
          open={this.state.navigationOpen}
          onClose={() => this.setState({ navigationOpen: false })}
        >
          <AppBar position="static">
            <Toolbar disableGutters variant="dense">
              {toolbarItems}
            </Toolbar>
          </AppBar>
          <List className="navigation-list">
            <ListItem
              button
              component="a"
              href="/teams"
              onClick={(event: MouseEvent) => this.onNavigationItemClick(event, '/teams')}
              selected={this.isSelected('/teams')}
            >
              <ListItemIcon>
                <RecentActors color={this.getColor('/teams')} />
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItem>
            <ListItem
              button
              component="a"
              href="/events"
              onClick={(event: MouseEvent) => this.onNavigationItemClick(event, '/events')}
              selected={this.isSelected('/events')}
            >
              <ListItemIcon>
                <Event color={this.getColor('/events')} />
              </ListItemIcon>
              <ListItemText primary="Events" />
            </ListItem>
            <ListItem
              button
              component="a"
              href="/skills"
              onClick={(event: MouseEvent) => this.onNavigationItemClick(event, '/skills')}
              selected={this.isSelected('/skills')}
            >
              <ListItemIcon>
                <FormatListNumbered color={this.getColor('/skills')} />
              </ListItemIcon>
              <ListItemText primary="Skills" />
            </ListItem>
          </List>
        </Drawer>
        <Drawer
          anchor="right"
          open={this.state.searchOpen}
          onClose={() => this.setState({ searchOpen: false })}
        >
          <div className="search-container">
            <TextField
              className="search-field"
              autoFocus
              placeholder="Search"
              onChange={event => this.onSearchChange(event.target.value)}
            />
            <Search className="search-icon" />
          </div>
          <List className="search-list">
            {this.state.teams.map(team => (
              <ListItem
                button
                component="a"
                href={`/teams/${vex.decodeProgram(team._id.program)}/${team._id.id}`}
                key={`${team._id.program}.${team._id.id}`}
              >
                <ListItemIcon>
                  <ProgramIcon program={team._id.program} />
                </ListItemIcon>
                <ListItemText primary={team._id.id} secondary={team.name} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      </div>
    );
  }
}

export default withRouter(App);
