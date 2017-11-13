import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import Error from '../components/Error';
import Items from './Items';
import Journal from './Journal';
import LoreContainer from './Lore';

import { CharacterSheet, CharacterCard, CharacterList } from '../components/characters';
import HeaderImage from '../components/HeaderImage';

class Character extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

    this.state = { character: this.props.character }
  }

  onFetch(data) {
    // determine if the data being returned is a character or list of characters
    if(Array.isArray(data)) return this.setState({characters: data, character: null}) 
    this.setState({character: data, charactes: null})
  }

  render() {
    let { match } = this.props;
    let { error, character, characters } = this.state

    if(error) return <Error error={error}/>
    if(!character && !characters) return null;

    // TODO: use the Character container to handle both characters and lists of characters
    // TODO: more support for character routes with options based on context
    if(characters) return <CharacterList characters={characters}/>

    return (
      <div>
        <HeaderImage images={character.Images} alt={character.name}/>
        <div className="tab-group">
          <NavLink to={match.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
          <NavLink to={match.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
          <NavLink to={match.url + "/lore"} className="tab" activeClassName="active">Lore</NavLink>
        </div>
        <h1>{character.name}</h1>
        <label>{`As of ${this.lastFetch.toLocaleString()}`}</label>

        {match.isExact && <CharacterSheet character={character}/>}

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
