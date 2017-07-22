import React from 'react';

import Dropdown from './dropdown'
import Navlink from './navlink'

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.obtainObject = this.obtainObject.bind(this);
  }

  // use this to get information about an object and deliver it to the root
  obtainObject(){
  
  }

  render() {
    if(!this.props.user) return null;
    return <nav className="navigation">
      {this.props.user && 
          <Dropdown label={this.props.user.username} >
            <Navlink label="Account"/>
            <Navlink label="Inbox"/>
            <Navlink label="Log Out"/>
          </Dropdown>
      }
      {this.props.character && 
          <Dropdown label={this.props.character.name} >
            <Dropdown label="Switch">
              <Navlink label="New Character"/>
            </Dropdown>
            <Navlink label="Character Sheet" href={this.props.character.url}/>
            <Navlink label="Inventory"/>
            <Navlink label="Journal"/>
            <Navlink label="Knowledge"/>
          </Dropdown>
      }
      {this.props.campaign && 
          <Dropdown label={this.props.campaign.name} >
            <Navlink label="Quests"/>
            <Navlink label="Factions"/>
            <Navlink label="Map"/>
            <Navlink label="Lore"/>
          </Dropdown>
      }
    </nav>

  }
}
