import { Component } from 'react';

import { ITEMS_PER_PAGE } from '../constants'

import { graphql } from 'react-apollo';

import { connect } from 'react-redux';
import { getSession } from '../actions';

export default class ReloadingView extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
    this.setFilter = this.setFilter.bind(this);

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

  onFetch(data) {
    this.setState({data});
  }

  setFilter(event) {
    let { name, value } = event.target
    let { filter } = this.state

    value = !isNaN(value) && value !== '' ? Number(value) : value

    this.setState({filter: {...filter, [name]: value}})
    // this.setState({filter})
  }
  

  // TODO: use document.hasFocus() to only reload resources when the document has focus
  loadData(props) {
    let { match } = props || this.props;
    let { initialized } = this.state
    this.lastFetch = new Date();

    clearTimeout(this.refreshInterval);

    // if the document doesn't have focus, check again every second until it does
    if(!document.hasFocus() && initialized) {
      this.refreshInterval = setTimeout(() => this.loadData(), 1000)
      return;
    }

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => {
      // if the response was redirected, change the location to reflect the new resource
      if(response.redirected) return history.pushState({}, null, response.url);
      this.refreshInterval = setTimeout(() => this.loadData(), 300000)
      // handle non-200 errors
      if(response.status !== 200) {
        return response.json()
        .then(error => {
          if(this.onError) {
            this.setState({mountedRoute: match.url, initialized:true})
            return this.onError(error);
          }
          this.setState({error, mountedRoute: match.url, initialized:true})
        })
      }

      return response.json()    
      .then(data => this.onFetch(data))
      .then(() => this.setState({mountedRoute: match.url, initialized:true}))
    })
    .catch(err => {
      console.error(err);
      err.status = 500
      err.stack = err.stack.split('\n')

      if(this.onError) return this.onError(err);
      return this.setState({error: err})
    })
  }

  componentDidMount() {
    this.loadData();
  }

  /* ==============================
   * Discriminatory Reloader:
   *    if a ReloadingView component receives new props,
   *    it's either loading a nested resource or loading
   *    a different resource that uses the same container 
   * ============================== */

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
