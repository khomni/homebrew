import React from 'react';
import { render } from 'react-dom';

import Ajax from '../ajax';
import Promise from 'bluebird';

global.Ajax = Ajax;
global.Promise = Promise;

import Navbar from './components/navbar';
import Draggable from './components/draggable.jsx';
import CharStatus from './components/character/status.jsx';

export default class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initialized: false,
      user: null,
      campaign: null,
      character: null,
      view: 'home'
    }
  }

  componentDidMount() {
    if(!this.state.user) {
      return Ajax.json({url: '/?session'})
      .then(data => {
        this.setState(Object.assign(data,{initialized:true}));
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
      
      {this.state.character && 
        <Draggable>
          <CharStatus character={this.state.character} />
        </Draggable>
      }

      </div>
      

    </div>
  }
}

let root = document.getElementById('root')

render(<Root/>, root);
