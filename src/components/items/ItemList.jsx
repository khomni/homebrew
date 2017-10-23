import React from 'react';

import { ITEMS_PER_PAGE } from '../../constants'

import {
  default as Item,
  ItemRow,
  ItemTile
} from './Item';

const Items = (props) => (
  <div>
    <h2>Inventory</h2>
    <div className="flex">
      <button className="as-link" name="layout" value="table" onClick={props.setFilter}>Table</button>
      <button className="as-link" name="layout" value="list" onClick={props.setFilter}>List</button>
      <button className="as-link" name="layout" value="grid" onClick={props.setFilter}>Grid</button>
    </div>
    <input value={props.filter.search} name="search" className="form-input" onChange={props.setFilter}/>
    { props.filter.layout === "list" && <ItemList {...props}/> ||
      props.filter.layout === "grid" && <ItemGrid {...props}/> ||
      <ItemTable {...props}/>
    }
  </div>
)

export const ItemList = ({items, setFilter, filter}) => (
  <div>
    {items.map(item => <Item key={item.id} item={item}/>)}
  </div>
)

export const ItemGrid = ({items, setFilter, filter, match}) => (
  <div className="flex pad js as">
    {items.map(item => <ItemTile key={item.id} item={item} match={match}/>)}
  </div>
)

const TableFilter = ({children, filter, setFilter, name}) => (
  <th className={filter.key === name && (filter.order === -1 ? "desc" : "asc") || ""}>
    { filter.key === name ? (
      <button className="as-link" name="order" value={filter.order * -1} onClick={setFilter}>
        {children}
      </button>
    ) : (
      <button className="as-link" name="key" value={name} onClick={setFilter}>
        {children}
      </button>
    )}
  </th>
)

export const ItemTable = ({items, setFilter, filter, match, total}) => (
  <table className="monospace">
    <colgroup>
      <col className="small"/>
      <col/>
      <col className="small"/>
      <col className="small"/>
      <col className="small"/>
    </colgroup>
    <thead>
      <tr>
        <TableFilter name="id" filter={filter} setFilter={setFilter}>
          ID
        </TableFilter>
        <TableFilter name="name" filter={filter} setFilter={setFilter}>
          Name
        </TableFilter>
        <TableFilter name="quantity" filter={filter} setFilter={setFilter}>
          Quantity
        </TableFilter>
        <TableFilter name="value" filter={filter} setFilter={setFilter}>
          Value
        </TableFilter>
        <TableFilter name="weight" filter={filter} setFilter={setFilter}>
          Weight
        </TableFilter>
      </tr>
    </thead>
    <tbody>
      {items.map(item => <ItemRow key={item.id} item={item} match={match}/>)}
    </tbody>
    <tfoot>
      {total.entries > items.length > ITEMS_PER_PAGE &&
        <tr>
          <td colSpan="5">
            <button className="as-link" name="results" value={ items.length + ITEMS_PER_PAGE } onClick={setFilter}>
              See More
            </button>
          </td>
        </tr>
      }
      <tr>
        <td colSpan="2">
        </td>
        <td>{total.total}</td>
        <td>{total.value}</td>
        <td>{total.weight}</td>
      </tr>
    </tfoot>
  </table>
)

export default Items
