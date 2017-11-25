import React from 'react';
import withResource from '../utils/ReloadingView'
import { Router, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Items as ItemList, Item } from '../components/items';
import { ITEMS_PER_PAGE } from '../constants';

import { ITEM } from '../../graphql/queries'

class Items extends React.Component{
  constructor(props) {
    super(props);
  }

  render() {
    let { item, match, setFilter, filter } = this.props;
    let items

    if(item.items.length === 1) return <Item item={item.items} match={match}/>

    let total = {
      total_quantity: item.total_quantity,
      total_weight: item.total_weight,
      total_value: item.total_value,
    }


    let subtotal = {
      total_quantity: 0,
      total_value: 0,
      total_weight: 0,
    }


    let {page, key, order, search, results} = filter
    let start = page * results
    let end = start + results
    console.log(item.items);

    items = item.items
    .map(item => {
      console.log(item, typeof item.id)
      item.id = Number(item.id);
      return item;
    })
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
        subtotal[key] += item[key] || 0
      })
    })

    console.log(total, subtotal);

    return (
      <div>
        <ItemList layout="table" total={total} subtotal={subtotal} items={items} filter={filter} setFilter={setFilter} match={match}/>;
        <Route path={match.url + '/:slug'} component={Items}/>
      </div>
    )
  }
}

Items.propTypes = {
  // dispatch: PropTypes.func.isRequired
}


export default withResource(Items, {
  query: ITEM,
  alias: 'item',
  variables: props => ({
    slug: props.match.params.item,
    detail: !!props.match.params.item
  })
})

