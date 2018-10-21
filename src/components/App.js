import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Drawer, AppBar, Toolbar, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Input, Divider } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { withStyles } from '@material-ui/core/styles';
import { Menu as MenuIcon, Search as SearchIcon, RecentActors as RecentActorsIcon, Event as EventIcon, FormatListNumbered as FormatListNumberedIcon } from '@material-ui/icons';

const styles = theme => ({
  root: {
    flexGrow: 1,
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    width: '100%'
  },
  appBar: {
    position: 'absolute'
  },
  toolbar: theme.mixins.toolbar,
  drawerButton: {
    padding: theme.spacing.unit,
    marginRight: theme.spacing.unit * 2
  },
  title: {
    textDecoration: 'none'
  },
  grow: {
    flexGrow: 1
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.10),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.15)
    },
    marginLeft: theme.spacing.unit,
    width: 'auto'
  },
  searchIcon: {
    width: theme.spacing.unit * 5,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit',
    width: '100%'
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 5,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200
      }
    }
  },
  drawerPaper: {
    width: 240,
    [theme.breakpoints.up('md')]: {
      position: 'relative'
    }
  },
  listItem: {
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.15)
    }
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  }
});

class App extends Component {
  state = {
    mobileOpen: false,
    selectedIndex: 0
  };

  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  handleLogoClick = () => {
    this.setState(state => ({ selectedIndex: 0 }));
  };

  handleListItemClick = (event, index) => {
    this.setState(state => ({
      mobileOpen: !state.mobileOpen,
      selectedIndex: index
    }));
  };

  render() {
    const { classes, theme } = this.props;

    return (
      <div className={classes.root}>
        <AppBar className={classes.appBar}>
          <Toolbar variant="dense">
            <IconButton
              className={classes.drawerButton}
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" width="2rem">
              <path fill="#f44336" d="M9 0H6v4.169L3.499 0H0l6 10h3V0z"/>
              <path fill="#2196f3" d="M12 0H9v10h3c2.21 0 4-2.239 4-5s-1.79-5-4-5z"/>
            </svg>
            <Typography
              className={classes.title}
              variant="title" color="inherit" noWrap
              component={Link} to="/"
              onClick={this.handleLogoClick}
            >
              VEX Data
            </Typography>
            <div className={classes.grow} />
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <Input
                placeholder="Search…"
                disableUnderline
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput
                }}
              />
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={this.state.mobileOpen}
          onClose={this.handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper
          }}
          ModalProps={{
            keepMounted: true
          }}
        >
          <Toolbar variant="dense">
            <IconButton
              className={classes.drawerButton}
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" width="2rem">
              <path fill="#f44336" d="M9 0H6v4.169L3.499 0H0l6 10h3V0z"/>
              <path fill="#2196f3" d="M12 0H9v10h3c2.21 0 4-2.239 4-5s-1.79-5-4-5z"/>
            </svg>
            <Typography
              className={classes.title}
              variant="title" color="inherit" noWrap
              component={Link} to="/"
              onClick={this.handleLogoClick}
            >
              VEX Data
            </Typography>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItem
              className={classes.listItem}
              component={Link} to="/teams"
              selected={this.state.selectedIndex === 1}
              onClick={event => this.handleListItemClick(event, 1)}
            >
              <ListItemIcon>
                <RecentActorsIcon color={this.state.selectedIndex === 1 ? 'primary' : 'inherit'}/>
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItem>
            <ListItem
              className={classes.listItem}
              component={Link} to="/events"
              selected={this.state.selectedIndex === 2}
              onClick={event => this.handleListItemClick(event, 2)}
            >
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary="Events" />
            </ListItem>
            <ListItem
              className={classes.listItem}
              component={Link} to="/skills"
              selected={this.state.selectedIndex === 3}
              onClick={event => this.handleListItemClick(event, 3)}
            >
              <ListItemIcon>
                <FormatListNumberedIcon />
              </ListItemIcon>
              <ListItemText primary="Skills" />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          {this.props.children}
        </main>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
