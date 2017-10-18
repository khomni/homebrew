import { Component } from 'react';

export default class ReloadingView extends Component {
  constructor(props) {
    super(props);
    this.loadData = this.loadData.bind(this);
  }

  loadData(props) {
    let { match } = props || this.props;
    this.lastFetch = new Date();

    clearInterval(this.refreshInterval);

    return fetch(match.url, {credentials: 'include', headers: {Accept: 'application/json'}})
    .then(response => {
      this.refreshInterval = setInterval(() => this.loadData(), 300000)
      console.log('ReloadingView', response)
      // handle non-200 errors
      if(response.status !== 200) {
        return response.json()
        .then(error => this.setState({error}))
      }

      return response.json()    
      .then(data => this.onFetch(data))
    })
  }

  componentDidMount() {
    this.loadData();
  }

  componentWillReceiveProps(nextProps){
    let { params } = this.props.match;
    let nextParams = nextProps.match.params;

    // if a route receives new route parameters, load new data
    for(let key in params) {
      if(nextParams[key] && params[key] !== nextParams[key]) return this.loadData(nextProps);
    }
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval);
  }

}


