import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import Lore, { LoreList, Knowledge } from '../components/lore';

import { KNOWLEDGE } from '../../graphql/queries';

import withResource from '../utils/ReloadingView';

class KnowledgeContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { knowledge, match, name, filter, setFilter } = this.props
    // let { invalidFilter, error, lore, filter } = this.state

    if(!knowledge) return null;

    return (
      <div>
        <h2>Knowledge</h2>
        <Knowledge knowledge={knowledge} {...this.props}/>
      </div>
    )
  }
}

// <LoreList match={match} lore={lore} filter={filter} setFilter={this.setFilter}/>

KnowledgeContainer.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default withResource(KnowledgeContainer, {
  query: KNOWLEDGE,
  alias: 'knowledge',
  variables: props => ({
    slug: props.slug || props.match.params.slug,
    character: props.character ? props.character.id : undefined,
  })
})

