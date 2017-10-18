import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import Error from '../components/Error';
import Items from './Items';
import Journal from './Journal';
import Knowledge from './Knowledge';

class CharacterSheet extends ReloadingView {
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
        </Switch>

      </div>
    )
  }
}

CharacterSheet.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStatetoProps = (state, ownProps) => {
  // let { character } = state.resources;
  return {}
}

export default withRouter(connect(mapStatetoProps)(CharacterSheet))
