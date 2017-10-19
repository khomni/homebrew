import { Component } from 'react';

export default class ReloadingView extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);

    this.state = {mountedRoute: this.props.match.url}
  }

  // TODO: use document.hasFocus() to only reload resources when the document has focus
  loadData(props) {
    let { match } = props || this.props;
    this.lastFetch = new Date();

    clearInterval(this.refreshInterval);

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => {
      this.refreshInterval = setInterval(() => this.loadData(), 300000)
      // handle non-200 errors
      if(response.status !== 200) {
        return response.json()
        .then(error => this.setState({error, mountedRoute: match.url}))
      }

      return response.json()    
      .then(data => this.onFetch(data))
      .then(() => this.setState({mountedRoute: match.url}))
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

    console.log(mountedRoute, nextRoute)
    // console.log(mountedRoute, nextProps.match.url, mountedRoute !== nextProps.match.url)

    if(mountedRoute && mountedRoute !== nextRoute) return this.loadData(nextProps);
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

}
