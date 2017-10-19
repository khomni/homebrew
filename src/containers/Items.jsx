import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

class Items extends ReloadingView {
  constructor(props) {
    super(props);

    this.state = { item: null, sort: ['updatedAt', -1] }
  }

  onFetch(item) {
    this.setState({item});
  }

  render() {
    let { match } = this.props;
    let { item, sort } = this.state;
    // TODO: before character is initialized, show a loading effect

    if(!item) return null;

    if(item.items) {
      let { items } = item
      items = items ? items.sort((a,b) => a[sort[0]] - b[sort[0]] * sort[1]) : []

      return (
        <div key={match.url}>
          {items.map(item => {
            return <pre key={item.id}>{JSON.stringify(item, null, '  ')}</pre>
          })}
        </div>
      )
    }

    return (
      <div key={match.url}>
      </div>
    )
  
  }
}

Items.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default Items

