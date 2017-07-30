import React from 'react';

import Dropdown from './dropdown'
import Navlink from './navlink'

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  // use this to get information about a resource and deliver it to the root
  // this also depends on a corresponding react component to display the resource

  render() {
    if(!this.props.user) return null;

    return <nav className="navigation">
      {this.props.user && 
        <Dropdown label={this.props.user.username} >
          <Navlink {...this.props}> Account </Navlink>
          <Navlink {...this.props}> Inbox </Navlink>
          <Navlink {...this.props}> Log Out </Navlink>
        </Dropdown>
      }

      {this.props.campaign ? (

        <Dropdown label={this.props.campaign.name}>
          <Navlink {...this.props}> Quests </Navlink>
          <Navlink {...this.props}> Factions </Navlink>
          <Navlink {...this.props}> Map </Navlink>
          <Navlink {...this.props}> Lore </Navlink>
        </Dropdown>

      ) : (

        <Dropdown label="Campaign">
          <Navlink href="/c/new" > New Campaign </Navlink>
          <Navlink href="/c/" view="Campaign" {...this.props}> Campaigns </Navlink>
        </Dropdown>

      )}

      {this.props.character ? ( 
        <Dropdown label={this.props.character.name} >
          <Dropdown label="Switch">
            <Navlink label="New Character" href="/pc/new" {...this.props}/>
          </Dropdown>
          <Navlink label="Character Sheet" href={this.props.character.url}/>
          <Navlink label="Inventory" href={this.props.character.url + '/inventory'} {...this.props}/>
          <Navlink label="Journal" href={this.props.character.url + '/journal'} {...this.props}/>
          <Navlink label="Knowledge" href={this.props.character.url + '/knowledge'} {...this.props}/>
        </Dropdown>
      ) : (
        <Navlink disabled={!this.props.campaign} href="/pc/new">New Character</Navlink>
      )}
    </nav>

  }
}
