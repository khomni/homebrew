import React from 'react';

import { withRouter, Route, Link, Switch } from 'react-router-dom';

const Item = ({item}) => (
  <pre className="shutter-down">{JSON.stringify(item, null, '  ')}</pre>
)

export const ItemTile = ({item, match}) => (
  <Link className="item-tile flex vert center text-center no-link" data-rarity={item.rarity} to={match.url + '/' + item.id}>
    <div>{item.name}</div>
    {item.quantity > 1 && <div>{`×${item.quantity}`}</div>}
    <div>{Number(item.weight * item.quantity).toFixed(1)}</div>
    <div>{Number(item.value * item.quantity)}</div>
  </Link>
)

export const ItemRow = ({item, match}) => (
  <tr>
    <th>{item.id}</th>
    <td> <Link to={match.url + '/' + item.id}>{item.name}</Link> </td>
    <td>{item.quantity}</td>
    <td>{item.value}</td>
    <td>{item.weight}</td>
  </tr>
)

export default Item
