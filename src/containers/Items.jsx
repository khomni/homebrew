import React from 'react';
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

class Items extends React.Component {
  constructor(props) {
    super(props);

    this.state = { items: null }
  }

  componentDidMount() {
    let { match } = this.props
    let items = this.props.items || this.state.items

    if(items) return;

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => response.json())
    .then(json => {
      let {items, total} = json

      this.setState({items, total})
    })

    // dispatch actions on app start
  }

  render() {
    let { match } = this.props;
    let { items } = this.state;
    // TODO: before character is initialized, show a loading effect

    return (
      <div>
        <h2> Inventory </h2>
        {items && items.map(item => {
          return <pre key={item.id}>{JSON.stringify(item, null, '  ')}</pre>
        })}
      </div>
    )
  }
}

Items.propTypes = {
  // dispatch: PropTypes.func.isRequired
}

/*
const mapStatetoProps = (state, ownProps) => {
  return {}
}

export default withRouter(connect(mapStatetoProps)(Items))
*/
export default Items

