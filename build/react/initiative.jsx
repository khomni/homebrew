import React from 'react';
import { render } from 'react-dom';

import Ajax from '../ajax';
import Promise from 'bluebird';

global.Ajax = Ajax;
global.Promise = Promise;

import CharOption from './components/character/charoption'
import Combatant from './components/character/combatant'
// INITIATIVE:
// An applet that

export default class Initiative extends React.Component {
  constructor(props) {
    super(props);
    // campaign: CampaignId obtained from the root element
    // user: UserId obtained from the root element
    this.addToInitiative = this.addToinitiative.bind(this);
    this.removeFromInitiative = this.removeFromInitiative.bind(this);
    this.getCharacterList = this.getCharacterList.bind(this);

    this.state = {
      campaign: null, // 
      characters: {}, //
      combatants: {},
    }
  }

  getMonster(){
    
    return 
  
  }

  // fetches an updated character list from the server
  getCharacterList(){

    return Promise.try(() => {
      // if there is no campaign information, get it here
      if(this.state.campaign) return this.state.campaign
      return Ajax.json({url:'/c/' + this.props.campaign})
      .then(campaign => {
        this.state.campaign = campaign
        return this.state.campaign
      })
    })
    .then(campaign => {
      return Ajax.json({url: campaign.url + 'pc'})
    })
    .then(characters => {
      characters.map(c => this.state.characters[c.id] = c)
      this.forceUpdate();
    })
  
  }

  componentWillMount(){
    // get the campaign
    return this.getCharacterList();

  }

  // takes the character data and adds their character data to the combat area
  addToinitiative(character) {

    Object.keys(this.state.combatants)
    .sort((a,b) => this.state.combatants[a].position - this.state.combatants[b].position)
    .reduce((a,b) => {
      if(a == false) {
        // some fucked up horseshit prevents this from being in the same conditional
        if(this.state.combatants[b].position != 0) this.state.combatants[b].position = 0;
      }
      else if(this.state.combatants[b].position - this.state.combatants[a].position > 1) {
        this.state.combatants[b].position = this.state.combatants[a].position + 1
      }
      return b
    }, false)
    let positions = Object.values(this.state.combatants).map(c => c.position)

    this.state.combatants[character.id] = {position: Math.max.apply(null, positions) + 1};
    this.forceUpdate();
  }

  // removes the character from the combat area and reenables the character from the selection
  removeFromInitiative(character) {
    delete this.state.combatants[character.id];
    this.forceUpdate();
  }

  render() {
    let characters = Object.keys(this.state.characters).map(key => this.state.characters[key]).sort((a,b,) => a.name - b.name)
    let combatants = Object.keys(this.state.combatants).sort((a,b) => this.state.combatants[a].position - this.state.combatants[b].position).map(key => this.state.characters[key])

    return (
      <div className="initiative flex horz grow">
        <div className="character-list sidebar flex vert">
          {characters.map(character => {
            return <CharOption key={character.id} disabled={!!this.state.combatants[character.id]} character={character} onClick={this.addToInitiative}>
              {character.Images[0] && <img src={character.Images[0].path} className="character-image"/>}
              {character.name} 
            </CharOption>
          })}

          <label onClick={this.getCharacterList}>
            <i className="fa fa-refresh" />
          </label>

        </div>

        <div className="combat-area grow">

          {combatants.map(character => {
            return <Combatant key={character.id} character={character} removeChar={this.removeFromInitiative}/>
            return (
              <div className="combatant app-panel grow" key={character.id}>
                <CharOption character={character} onClick={this.removeFromInitiative}>
                  <a className="close float right"/>
                </CharOption>
                <label>{character.name}</label>
              </div>
            )


          })}
        </div>
        
      </div>
    )

  }
}


// Render the initiative app with some of the values initialized by the view;
let initiative = document.getElementById('initiative-app');
let user = initiative.dataset.user;
let campaign = initiative.dataset.campaign;

render(<Initiative user={user} campaign={campaign}/>, initiative);
