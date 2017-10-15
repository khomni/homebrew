import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import Items from './Inventory';

class CharacterSheet extends React.Component {
  constructor(props) {
    super(props);

    this.state = { character: null }
  }

  componentWillMount() {
    let { match } = this.props

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => response.json())
    .then(json => {
      this.setState({character: json})
    })

    // dispatch actions on app start
  }

  render() {
    let {character} = this.state;
    let { match } = this.props;
    // TODO: before character is initialized, show a loading effect
    if(!character) return null;

    return (
      <div>
        {character.Images.map(image => {
          return <img src={image.path} alt={character.name}/>
        })}
        <h1>{character.name}</h1>
        <pre>{JSON.stringify(character,null,'  ')}</pre>

        <Switch>
          <Route path={match.url + "/inventory"} component={Items}/>
        </Switch>


      </div>
    )
  }
}

CharacterSheet.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStatetoProps = (state, ownProps) => {
  return {}
}

export default withRouter(connect(mapStatetoProps)(CharacterSheet))
