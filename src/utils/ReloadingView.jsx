import React, { Component } from 'react';

import { ITEMS_PER_PAGE } from '../constants'

import { withRouter } from 'react-router-dom';
import { graphql, withApollo } from 'react-apollo';
import { connect } from 'react-redux';
import { getSession } from '../actions';

import Error from '../components/Error';
import Loading from '../components/Loading';

/* ==============================
 * withResource / ReloadingView:
 *      Abstraction HOC that automatically connects to the apolloclient and redux store to load server data
 *      Goal: to simplify the amount of scaffolding required for a single resource view page using similar query logic and standardize
 *              1. error display
 *              2. result filtering controls
 *              3. result layout controls
 *
 *      A regular resource container wrapped with this HOC should check for these propTypes, provided by this HOC:
 *              dispatch: PropTypes.func.isRequired
 *              match: PropTypes.object.isRequired
 * ============================== */

export default function withResource(WrappedComponent, {query, variables, alias, subscription}) {

  // TODO: reimplement frontend filtering functionality
  class Wrapper extends Component {
    constructor(props) {
      super(props);
      this.setFilter = this.setFilter.bind(this)

      let defaultFilter = Object.assign({
        search: '',
        layout: props.layout || null,
        key: 'updatedAt',
        order: -1,
        page: 0,
        results: ITEMS_PER_PAGE,
      }, this.props.filter || {})

      this.state = {
        mountedRoute: this.props.match.url,
        filter: defaultFilter
      }
    }

    setFilter(event) {
      let { name, value } = event.target
      let { filter } = this.state

      value = !isNaN(value) && value !== '' ? Number(value) : value

      this.setState({filter: {...filter, [name]: value}})
     }

    componentDidMount() {
      // console.log('withResource', this.props.data)
    }

    componentWillMount() {
      // if the props include a subscribe method, call it as soon as the component is ready to mount
      //        this will ensure that all reloading components will receive subscription events from the server
      const { subscribe } = this.props;
      if(subscribe) return subscribe();
    }

    render() {
      const { error, loading, refresh, dispatch } = this.props;
      const { filter } = this.state;

      if(error) return <Error error={error} />
      if(loading) return <Loading/>
      return <WrappedComponent setFilter={this.setFilter} filter={filter} {...this.props} />
    }
  }

  // Use the redux store to allow components to access the Session user / character / campaign.
  // TODO: add to this function if this standardized resource fetching mechanism needs to use more of the redux store
  // TODO: allow arguments to withResource to modify this mapping function?
  const mapStateToProps = ({session}) => ({session})

  // graphql container:
  // takes the input query and 
  // TODO: set polling interval (or subscription settings when applicable)
  let gContainer =  graphql(query, {

    // set the Wrappers props using the data returned by GraphQL endpoint and own props
    props: ({ownProps, data}) => {

      let props = {
        loading: data.loading,
        error: data.error,
        refetch: data.refetch,
        updateQuery: data.updateQuery,
        [alias || 'data']: alias ? data[alias] : data,
        data,
      };

      // EXPERIMENTAL: allow reloading components to include a subscription query that 
      //        automatically updates the cache when the server publishes it
      if(subscription) props.subscribe = (params) => data.subscribeToMore({
        document: subscription,
        variables: variables ? variables(ownProps) : null,
        updateQuery: (prev, {subscriptionData}) => { // returns a combination of the old data and the new data

          if(!subscriptionData.data) return prev
          // TODO: determine if this update is updating an existing object, or inserting an object into the current collection (if an array)
          console.warn('Subscription updates have not been fully implemented in ReloadingView.jsx;', 'previous value:', prev, 'pushed update:' , subscriptionData);
          return prev
        }
      })

      console.log(ownProps.match.url, data[alias] || data)

      return Object.assign({}, ownProps, props);
    },
    options: props => ({
      variables: variables ? variables(props) : null
    })
  })(Wrapper)

  return withRouter(withApollo(connect(mapStateToProps)(gContainer)))
}

/* ==============================
 * resourceForm:
 *      HOC that wraps a component with everything required to update the 
 * ============================== */

export function resourceForm(WrappedComponent, {query, variables, alias}) {

  class Wrapper extends Component {
    constructor(props) {
      super(props);
      this.submit = this.submit.bind(this);

      // form data should be stored in state until submitted
      this.state = {}
    }

    submit() {
      const { client } = this.props;

      return client.mutate({
        variables: {
          ...variables,
          [alias]: this.state,
        }
      })
    
    }

    render() {
      const { error, loading, refresh, dispatch } = this.props;
      const { filter } = this.state
      if(error) {
        return <Error error={error} />
      }
      if(loading) return <Loading/>
      return <WrappedComponent setFilter={this.setFilter} filter={filter} {...this.props} />
    }
  }

  return withRouter(withApollo(connect(mapStateToProps)(Wrapper)))


}
