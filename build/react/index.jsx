import React from 'react';
import { render } from 'react-dom';

import Ajax from '../ajax';
import Promise from 'bluebird';

global.Ajax = Ajax;
global.Promise = Promise;

import Navbar from './components/navbar';

export default class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      campaign: null,
      character: null,
    } 
  }

  componentDidMount() {
    if(!this.state.user) {
      return Ajax.json({url: '/?session'})
      .then(data => {
        this.setState(data);
      })
      .catch(err => console.error(err.stack))
    }
  }

  render() {
    return <div>

      <Navbar  
        user={this.state.user} 
        campaign={this.state.campaign} 
        character={this.state.character} />
      <div className="" id="content-wrapper" className="marble">

        // good stuff goes here

      </div>
      

    </div>
  }
}

let root = document.getElementById('root')

render(<Root/>, root);
