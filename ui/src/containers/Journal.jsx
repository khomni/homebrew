import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';


import { JOURNAL } from '../../graphql/queries';

import { JournalList, JournalEntry } from '../components/journal';
import withResource from '../utils/ReloadingView';

class Journal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { journal, match, setFilter, filter} = this.props;
    // TODO: before character is initialized, show a loading effect

    if(filter.search) {
      try {
        let searchRegExp = new RegExp(filter.search, 'mig')
        journal = journal.filter(entry => entry.title.match(searchRegExp) || entry.content.match(searchRegExp))
      } catch(e) {
        console.warn('Invalid search regex');
      }
    }

    return (
      <div>
        <JournalList journal={journal} setFilter={setFilter} />
      </div>
    )
  }
}

Journal.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

/*
const mapStatetoProps = (state, ownProps) => {
  return {}
}

export default withRouter(connect(mapStatetoProps)(Items))
*/

export default withResource(Journal, {
  query: JOURNAL,
  alias: 'journal',
  variables: props => ({
    // TODO: reorganize to allow search UI to be outside of the container
    // search: props.search,
    slug: props.match.params.slug,
    character: props.character ? props.character.id : undefined,
  })
})


