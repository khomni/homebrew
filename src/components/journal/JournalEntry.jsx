import React from 'react';

import ReactMarkdown from 'react-markdown';

export const JournalSummary = ({journal}) => (
  <div>
    <h3>{journal.title}</h3>
    <ReactMarkdown source={journal.content} />
  </div>
)

export const JournalEntry = ({journal}) => (
  <div>
    <h3>{journal.title}</h3>
    <ReactMarkdown source={journal.content} />
  </div>
)
export default JournalEntry 
