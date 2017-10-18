import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

class Journal extends React.Component {
  constructor(props) {
    super(props);

    this.state = { journal: null }
  }

  componentDidMount() {
    let { match } = this.props
    let journal = this.props.journal || this.state.journal

    if(journal) return;

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => response.json())
    .then(json => {
      this.setState({journal: json})
    })

    // dispatch actions on app start
  }

  render() {
    let { match } = this.props;
    let { journal } = this.state;
    // TODO: before character is initialized, show a loading effect

    return (
      <div>
        <h2> Journal </h2>
        {journal && journal.map(entry => {
          return <pre key={entry.id}>{JSON.stringify(entry, null, '  ')}</pre>
        })}
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
export default Journal


