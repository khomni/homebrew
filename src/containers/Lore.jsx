import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import Lore from '../components/views/Lore';

class LoreContainer extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.state = { 
      lore: this.props.lore || [],
      filter: '',
    }
  }

  onFetch(lore) {
    this.setState({lore})
  }

  onFilterChange(e){
    let filter = e.target.value;
    try {
      let regex = new RegExp(filter, 'mig');
      this.setState({invalidFilter: false, filter, regex});
    } catch(e) {
      this.setState({invalidFilter: true, filter})
    }
  }

  render() {
    let { match, name } = this.props
    let { invalidFilter, error, lore, filter, regex} = this.state

    name = name || 'Lore'

    lore = lore ? lore.filter(l => !filter || l.content.match(regex) ) : []

    if(error) return ( <Error error={error}/> )

    if(!lore) return null;

    return (
      <div>
        <h2> Lore </h2>
        <input className={'form-input' + (invalidFilter ? ' error' : '')} onChange={this.onFilterChange} value={filter} placeholder={`Search ${name}`}/>
        {lore && lore.map(lore => <Lore key={lore.id} lore={lore}/>)}
      </div>
    )
  }
}

LoreContainer.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default LoreContainer
