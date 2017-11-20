import React from 'react';

import { withRouter, Route, Link, Switch } from 'react-router-dom';
import Lore from '../lore';

const Item = ({item}) => (
  <div>
    <h3 data-rarity={item.rarity}>{item.name}</h3>
    {item.lore && item.lore.map(lore => <Lore lore={lore}/>)}
    <pre className="shutter-down">{JSON.stringify(item, null, '  ')}</pre>
  </div>
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
    <td data-rarity={item.rarity}> <Link to={match.url + '/' + item.id}>{item.name}</Link> </td>
    <td>{item.quantity}</td>
    <td>{item.total_value}</td>
    <td>{item.total_weight}</td>
  </tr>
)

export default Item
