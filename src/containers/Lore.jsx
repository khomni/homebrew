import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import Lore, { LoreList } from '../components/lore';

class LoreContainer extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

  }

  onFetch(lore) {
    if(!Array.isArray(lore)) lore = [lore]
    this.setState({lore})
  }

  render() {
    let { match, name } = this.props
    let { invalidFilter, error, lore, filter } = this.state

    if(error) return ( <Error error={error}/> )
    if(!lore) return null;
    console.log(LoreList);

    name = name || 'Lore'
    lore = lore.filter(l => !filter.search || l.content.match(new RegExp(filter.search, 'mig')) )

    return (
      <div>
        <h2>Lore</h2>
        <LoreList match={match} lore={lore} filter={filter} setFilter={this.setFilter}/>
      </div>
    )
  }
}

LoreContainer.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default LoreContainer
