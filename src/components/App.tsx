import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import TopAppBar, { TopAppBarFixedAdjust } from '@material/react-top-app-bar';
import Drawer, { DrawerContent } from '@material/react-drawer';
import MaterialIcon from '@material/react-material-icon';
import List, { ListItem, ListItemGraphic, ListItemText } from '@material/react-list';

import './App.scss';

type AppState = {
  open: boolean,
  selectedIndex: number
};

class App extends Component<RouteComponentProps, AppState> {
  state: AppState = {
    open: false,
    selectedIndex: this.getSelectedIndex()
  };

  getSelectedIndex() {
    switch (this.props.location.pathname) {
      case '/teams': return 0;
      case '/events': return 1;
      case '/skills': return 2;
      default: return -1;
    }
  }

  onNavigationIconClick() {
    this.setState(state => ({open: !state.open}));
  }

  onListItemClick(event: React.MouseEvent<HTMLElement, MouseEvent>, link: string) {
    this.props.history.push(link);
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <TopAppBar
          title="VEX Data"
          navigationIcon={<MaterialIcon
            icon="menu"
            onClick={() => this.onNavigationIconClick()}
          />}
        />
        <TopAppBarFixedAdjust>{this.props.children}</TopAppBarFixedAdjust>
        <Drawer
          className="drawer"
          modal
          open={this.state.open}
          onClose={() => this.setState({open: false})}
        >
          <TopAppBar
            className="drawer-app-bar"
            title="VEX Data"
            navigationIcon={<MaterialIcon
              icon="menu"
              onClick={() => this.onNavigationIconClick()}
            />}
          />
          <TopAppBarFixedAdjust>
            <DrawerContent>
              <List
                singleSelection
                selectedIndex={this.state.selectedIndex}
                handleSelect={selectedIndex => this.setState({open: false, selectedIndex})}
              >
                <ListItem
                  tag="a"
                  href="/teams"
                  onClick={event => this.onListItemClick(event, '/teams')}
                >
                  <ListItemGraphic graphic={<MaterialIcon icon="recent_actors" />} />
                  <ListItemText primaryText="Teams" />
                </ListItem>
                <ListItem
                  tag="a"
                  href="/events"
                  onClick={event => this.onListItemClick(event, '/events')}
                >
                  <ListItemGraphic graphic={<MaterialIcon icon="event" />} />
                  <ListItemText primaryText="Events" />
                </ListItem>
                <ListItem
                  tag="a"
                  href="/skills"
                  onClick={event => this.onListItemClick(event, '/skills')}
                >
                  <ListItemGraphic graphic={<MaterialIcon icon="format_list_numbered" />} />
                  <ListItemText primaryText="Skills" />
                </ListItem>
              </List>
            </DrawerContent>
          </TopAppBarFixedAdjust>
        </Drawer>
      </div>
    );
  }
}

export default withRouter(App);
