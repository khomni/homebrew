import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import Error from '../components/Error';
import Items from './Items';
import Journal from './Journal';
import LoreContainer from './Lore';

class Character extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

    this.state = { character: this.props.character }
  }

  onFetch(data) {
    this.setState({character:data});
  }

  render() {
    let { match } = this.props;
    let { error, character} = this.state

    if(error) return (
      <Error error={error}/>
    )

    // TODO: before character is initialized, show a loading effect
    if(!character) return null;

    // TODO: use the Character container to handle both characters and lists of characters
    // TODO: more support for character routes with options based on context
    if(Array.isArray(character)) return (
      <div key={match.url}>
        {character.map(character => {
          return <Link key={character.id} to={character.url}>{character.name}</Link>
        })}
      </div>
    )

    return (
      <div key={match.url}>
        {character.Images.map(image => {
          return <img key={image.id} src={image.path} alt={character.name}/>
        })}
        <h1>{character.name}</h1>
        <label>{`As of ${this.lastFetch.toLocaleString()}`}</label>

        <Switch>
          <Route path={match.url + "/inventory"} component={Items}/>
          <Route path={match.url + "/journal"} component={Journal}/>
          <Route path={match.url + "/knowledge"} component={LoreContainer}/>
        </Switch>

      </div>
    )
  }
}

Character.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStatetoProps = (state, ownProps) => {
  // let { character } = state.resources;
  return {}
}

export default withRouter(connect(mapStatetoProps)(Character))
