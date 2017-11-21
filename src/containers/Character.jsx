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

/* ============================== 
 * Apollo / GraphQL
 * ============================== */

import { graphql, withApollo } from 'react-apollo';
import { CHARACTER } from '../../graphql/queries'

class Character extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { match } = this.props;
    let { loading, character, error } = this.props
    let characters

    if(loading) return null;
    if(error) return <Error error={error}/>
    if(!character) return null;

    if(character.length > 1) characters = character;
    // TODO: use the Character container to handle both characters and lists of characters
    // TODO: more support for character routes with options based on context
    if(characters) return <CharacterList characters={characters}/>
    character = character.pop();

    console.log(character);

    return (
      <div>
        <HeaderImage images={character.images} alt={character.name}/>
        <div className="tab-group">
          <NavLink to={match.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
          <NavLink to={match.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
          <NavLink to={match.url + "/lore"} className="tab" activeClassName="active">Lore</NavLink>
        </div>
        <h1>{character.name}</h1>

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

const gContainer = graphql(CHARACTER, {
  props: ({ ownProps: { dispatch }, data: { character, loading, refetch, error } }) => 
    ({ loading, refetch, error, character }),
  options: props => ({
    variables: {
      slug: props.match.params.slug,
      detail: !!props.match.params.slug
    }
  })
})(Character)

const mapStateToProps = ({session}) => session

export default withApollo(withRouter(connect(mapStateToProps)(gContainer)))
