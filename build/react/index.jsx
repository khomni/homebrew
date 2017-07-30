import React from 'react';
import { render } from 'react-dom';

import Ajax from '../ajax';
import Promise from 'bluebird';

global.Ajax = Ajax;
global.Promise = Promise;

import Navbar from './components/navbar';
import Draggable from './components/draggable';
import CharStatus from './components/character/status';
import Views from './views/index'

export default class Root extends React.Component {
  constructor(props) {
    super(props);
    this.loadView = this.loadView.bind(this);

    this.state = {
      initialized: false,
      _user: null,
      _campaign: null,
      _character: null,
      view: 'Home', // the keyed value of the homepage
      locals: {},
    }
  }

  // loads resources into local variables and changes the view
  // can take any kind of request, and will load the component with the response as props
  loadView(view, request) { 
    if(!request) return this.setState({view:view})
    return Ajax.json(request)
    .then(response => {
      this.setState({
        view: view,
        locals: response
      })
    })
  
  }

  componentDidMount() {
    if(!this.state.user) {
      return Ajax.json({url: '/?session'})
      .then(data => {
        this.setState({
          initialized:true,
          _user: data.user,
          _character: data.character,
          _campaign: data.campaign
        });
      })
      .catch(err => console.error(err.stack))
    }
  }

  render() {
    let CurrentView = Views[this.state.view]

    return <div>

      <Navbar  
        loadView={this.loadView}
        user={this.state._user} 
        campaign={this.state._campaign} 
        character={this.state._character} />
      <div id="content-wrapper" className="marble">
      
      {this.state.character && 
        <Draggable>
          <CharStatus character={this.state.character} />
        </Draggable>
      }

      {this.state.view && 
        <div className="app-area">
          <CurrentView 
            user={this.state.user} 
            character={this.state.character}
            campaign={this.state.campaign}
            {...this.state.locals}
          /> 
        </div>
      }

      </div>
      

    </div>
  }
}

let root = document.getElementById('root')

render(<Root/>, root);
