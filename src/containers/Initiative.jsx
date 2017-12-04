/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';
import { PropTypes } from 'prop-types';

import { Link, Switch, Redirect, Route, withRouter} from 'react-router-dom';
import { connect } from 'react-redux';

import Systems, { constructor as SystemConstructor } from '../../system'

import ErrorPage from '../components/Error'
import InitiativeTable, { CreatureRow } from '../components/tools/Initiative'

import _ from 'lodash'

var uid = 0;

class CreatureContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { highlighted, creature, removeCreature, updateCreature } = this.props

    return <CreatureRow highlighted={highlighted} creature={creature} removeCreature={removeCreature} updateCreature={updateCreature}/>
  }

}

class Initiative extends React.Component {
  constructor(props) {
    super(props);
    this.removeCreature = this.removeCreature.bind(this);
    this.addCreature = this.addCreature.bind(this);
    this.updateCreature = this.updateCreature.bind(this);
    this.incrementCursor = this.incrementCursor.bind(this);
    this.reset = this.reset.bind(this);

    this.state = {
      round: 0,
      cursor: Infinity,
      system: null,
      creatures: []
    }
  }

  clear() {
  
  }

  // resets initiative
  reset() {
    let { creatures } = this.state
    creatures.forEach(c => {c.initiative = -Infinity})

    this.updateCreatureList({
      creatures,
      cursor: Infinity,
      round: 0,
    })
  }

  componentWillMount() {
    const { match: {params: {system} } } = this.props
    const System = Systems[system]

    this.setState({system: System})
  }

  // moves the cursor to the next initiative in order
  incrementCursor() {
    let { creatures, cursor, round } = this.state

    // exhausted is true if the entire creatures array can be reduce
    // an empty creatures array defaults to exhausted
    // any creature with an initiative lower than the cursor should make this false
    let exhausted = creatures.reduce((a,b) => a && !(b.initiative < cursor), true)

    if(exhausted) {
      cursor = Math.max.apply(null, creatures.map(creature => creature.initiative));
      round++;
      return this.setState({cursor, round})
    } else {
      for(let c in creatures) {
        if(creatures[c].initiative < cursor) {
          cursor = creatures[c].initiative
          console.log('decrement cursor:', cursor);
          return this.setState({cursor})
        }
      }
    }
  }

  // adds a blank creature to the initiative list
  addCreature() {
    let { creatures, system } = this.state
    let factions = ['ally', 'friendly', 'neutral', 'hostile']

    creatures.push({
      id: ++uid,
      label: ''
      initiative: Math.floor(Math.random() * 20),
      // initiative: -Infinity,
      faction: factions[Math.floor(Math.random() * factions.length)],
      hp: {
        current: Math.floor(Math.random() * 100),
        max: 100
      },
      creature: new system.Creature()
    })

    creatures = creatures.sort((a,b) => b.initiative - a.initiative)

    // this.setState({creatures})
    this.updateCreatureList({creatures})
  }

  // removes an entry from initiative
  removeCreature(event) {
    let { creatures, system } = this.state
    let removeID = Number(event.target.value)

    creatures = creatures.filter(creature => creature.id !== removeID)

    console.log('remove creature:', creatures)

    this.updateCreatureList({creatures})
  }

  updateCreature(id) {
    return function(event) {
      let { creatures } = this.state;
      let { value, name } = event.target;
      console.log('update creature:', name, value)
      creatures.forEach(creature => {
        if(creature.id === id) _.set(creature, name, value)
      });

      this.updateCreatureList({creatures})
    }.bind(this)
  }

  // use this to set the state when creatures are changed
  // handles sorting operations and set modifications
  updateCreatureList(args) {
    if('creatures' in args) {

      // if there are duplicate initiative values, make them fractional
      // TODO: make this algorithm less polynomial
      args.creatures.forEach(creature => {
        let matches = args.creatures
          .filter(c => c.initiative === creature.initiative)

        if(matches.length > 1) {
          let counter = 0
          matches.forEach(c => {
            c.initiative = Math.floor(c.initiative) + (counter++/matches.length)
          })
        }
      })


      // whenever creature list is updated, sort by initiative order
      args.creatures = args.creatures
        .sort((a,b) => {
          if(b.initiative - a.initiative) return b.initiative - a.initiative
          console.log(a.faction, b.faction, a.faction < b.faction)
          if(a.faction >= b.faction) {
            if(a.faction !== b.faction) return 1;
            return a.label < b.label
          }
          return -1
        })
    }

    this.setState(args)
  }


  render() {
    let error 
    const { match: {params: {system} } } = this.props
    const { cursor, round, system: System } = this.state

    // const System = Systems[system]
    if(!System) error = new Error(`${system} is not a supported rules system`)

    const Creature = System.Creature
    const CreatureSchema = Creature.schema.toJSON()

    if(error) {
      error.status = error.status || 400
      return <ErrorPage error={error}/>
    }

    // convert the creatures in state to the system's Creature object
    let { creatures } = this.state
    const { Quantifiable: {list: Quantifiable} } = System

    // TODO: add system configuration for the particular fields accessible in Initiative tool

    return (
      <div>
        <div className="flex horz pad">
          <label>Creatures: {creatures.length}</label>
          <label>Round: {round}</label>
          <button className='btn' onClick={this.addCreature}>Add Creature</button>
          <button className='btn' onClick={this.incrementCursor}>Next</button>
          <button className='btn' onClick={this.reset}>Reset</button>
        </div>
        <InitiativeTable system={System}>
          {creatures.map((creature,i) => 
            <CreatureContainer highlighted={cursor >= creature.initiative} key={creature.id} system={System} creature={creature} removeCreature={this.removeCreature} updateCreature={this.updateCreature}/>
          )}
        </InitiativeTable>
      </div>

    )
  
  }
}

Initiative.propTypes = { }


const mapStateToProps = ({session}) => session

export default withRouter(connect(mapStateToProps)(Initiative))
