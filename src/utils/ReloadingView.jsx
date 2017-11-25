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

export default function withResource(WrappedComponent, {query, variables, alias}) {

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
      console.log('withResource', this.props.data)
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

  // Use the redux store to allow components to access the Session user / character / campaign.
  // TODO: add to this function if this standardized resource fetching mechanism needs to use more of the redux store
  // TODO: allow arguments to withResource to modify this mapping function?
  const mapStateToProps = ({session}) => ({session})

  // graphql container:
  // takes the input query and 
  // TODO: set polling interval (or subscription settings when applicable)
  let gContainer =  graphql(query, {
    // set the Wrappers props using the data returned by GraphQL endpoint and own props
    // TODO: allow HOC to determine the props alias? Otheriwse, just use the data as a standard prop
    props: ({ownProps, data}) => {
      if(!data.loading) console.log('withResource:', data)
      return {
        loading: data.loading,
        error: data.error,
        refetch: data.refetch,
        updateQuery: data.updateQuery,
        [alias || 'data']: alias ? data[alias] : data,
        data,
      }
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

  /*
export class ReloadingView extends Component {
  constructor(props) {
    super(props);

    let defaultFilter = Object.assign({
      search: '',
      layout: props.layout || null,
      key: 'updatedAt',
      order: -1,
      page: 0,
      results: ITEMS_PER_PAGE,
    }, this.props.filter || {})

    this.state = {
      initialized: false,
      mountedRoute: this.props.match.url,
      filter: defaultFilter
    }
  }

  setFilter(event) {
    let { name, value } = event.target
    let { filter } = this.state

    value = !isNaN(value) && value !== '' ? Number(value) : value

    this.setState({filter: {...filter, [name]: value}})
    // this.setState({filter})
  }

  componentWillReceiveProps(nextProps){
    let { params } = this.props.match;
    let { mountedRoute } = this.state

    if(!mountedRoute) return;

    mountedRoute = this.state.mountedRoute.replace(/\/$/,'')
    let nextRoute = nextProps.match.url.replace(/\/$/,'')

    if(mountedRoute && mountedRoute !== nextRoute) return this.loadData(nextProps);
  }

  componentWillUnmount() {
    clearTimeout(this.refreshInterval);
  }

}
*/
