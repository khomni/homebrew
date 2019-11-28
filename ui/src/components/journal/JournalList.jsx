import React from 'react';

// import { ITEMS_PER_PAGE } from '../../constants'
import { JournalSummary } from './JournalEntry'

export const JournalList = (props) => (
  <div> 
    <h2>Journal</h2>
    <input value={props.filter && props.filter.search} name="search" className="form-input" onChange={props.setFilter}/>
    { props.journal.map(entry => (
      <JournalSummary key={entry.id} {...props} journal={entry}/>
    ))}
  </div>
)

export default JournalList
