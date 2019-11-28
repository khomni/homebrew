import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import Lore, { LoreList } from '../components/lore';
import { LORE } from '../../graphql/queries';

import withResource from '../utils/ReloadingView';

class LoreContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { lore, match, name, filter, setFilter } = this.props
    // let { invalidFilter, error, lore, filter } = this.state

    if(!lore) return null;

    name = name || 'Lore'
    lore = lore.filter(l => !filter.search || l.content.match(new RegExp(filter.search, 'mig')) )

    return (
      <div>
        <h2>Lore</h2>
        <LoreList match={match} lore={lore} filter={filter} setFilter={setFilter}/>
      </div>
    )
  }
}

LoreContainer.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default withResource(LoreContainer, {
  query: LORE,
  alias: 'lore',
  variables: props => ({
    slug: props.slug || props.match.params.slug,
    character: props.character ? props.character.id : undefined,
  })
})
