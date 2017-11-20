import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

import { Items as ItemList, Item } from '../components/items';
import { ITEMS_PER_PAGE } from '../constants';

class Items extends ReloadingView {
  constructor(props) {
    super(props);
  }

  onFetch(data) {
    if(data.items) return this.setState({items: data.items, total: data.total, item: null}) 
    this.setState({item: data, items: null, total: null})
  }

  render() {
    let { match } = this.props;
    let { item, items, total, filter, error } = this.state;
    let subtotal = {};


    if(error) return <Error error={error}/>

    if(items) {
      let {page, key, order, search, results} = filter
      let start = page * results
      let end = start + results
      total.entries = items.length;


      items = items
      .sort((a,b) => {
        if(a[key] > b[key]) return order
        if(a[key] < b[key]) return order * -1
        return 0
      })
      .filter(item => !filter.search || item.name && item.name.match(new RegExp(filter.search, 'mig')))
      .slice(start, end)

      items.map(item => {
        Object.keys(total).map(key => {
          subtotal[key] = subtotal[key] || 0;
          subtotal[key] += item[key]
        })
      })

      subtotal.entries = items.length;
    }

    if(item) return <Item item={item} match={match}/>

    return (
      <div>
        {items && <ItemList layout="table" items={items} total={total} subtotal={subtotal} filter={filter} setFilter={this.setFilter} match={match}/>}
        <Route path={match.url + '/:id'} component={Items}/>
      </div>
    )
  }
}

Items.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

export default Items

