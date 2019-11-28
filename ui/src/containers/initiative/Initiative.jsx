/* ============================== 
 * React
 * ============================== */

import _ from 'lodash'

import React from 'react';
import { render } from 'react-dom';
import { PropTypes } from 'prop-types';

import { Link, Switch, Redirect, Route, withRouter} from 'react-router-dom';
import { connect } from 'react-redux';

import Systems, { constructor as SystemConstructor } from '../../../system'

import ErrorPage from '../../components/Error'
import InitiativeTable from '../../components/tools/Initiative'
import CreatureRow from './CreatureRow';

import Experience from '../../../system/pathfinder/cr';

import generateGuid from '../../utils/guid'

class Initiative extends React.Component {
  constructor(props) {
    super(props);
    this.removeCreature = this.removeCreature.bind(this);
    this.addCreature = this.addCreature.bind(this);
    this.cloneCreature = this.cloneCreature.bind(this);
    this.updateCreature = this.updateCreature.bind(this);
    this.incrementCursor = this.incrementCursor.bind(this);
    this.reset = this.reset.bind(this);
    this.getInitiativeOrder = this.getInitiativeOrder.bind(this);
    this.changeFocus = this.changeFocus.bind(this);
    this.mapRef = this.mapRef.bind(this);
    this.saveLocal = this.saveLocal.bind(this);
    this.restoreLocal = this.restoreLocal.bind(this);

    this.state = {
      round: 0,
      cursor: Infinity,
      system: null,
      creatures: {},
      order: [], // ordered list of creature ids
      refMatrix: []
    }
  }

  componentWillMount() {
    const { match: {params: {system} } } = this.props
    const System = Systems.RuleSets[system]

    this.setState({system: System});
    this.restoreLocal();

  }

  componentWillUpdate(nextProps, nextState) {
    // determine if the order needs to be changed based on the initiative values
    let { order } = this.state
    let { creatures } = nextState

    let newOrder = this.getInitiativeOrder(creatures)
    // console.log(newOrder)
    for(let i = 0; newOrder[i] || order[i]; i++) {
      if(order[i] !== newOrder[i]) {
        return this.setState({order: newOrder})
      }
    }
  }

  // resets initiative
  reset() {
    let creatures = _.cloneDeep(this.state.creatures)

    for( let id in creatures ) {
      if(creatures[id]) creatures[id].initiative = -Infinity
    }

    this.setState({
      creatures,
      cursor: Infinity,
      round: 0,
    })
  }

  saveLocal() {
    const { creatures, order, round, cursor } = this.state;

    localStorage.setItem('initiative_state', JSON.stringify({creatures, order, round, cursor}))
  }

  restoreLocal() {
    // const { creatures, order, round, cursor } = this.state;

    let initiative_state = localStorage.getItem('initiative_state')
    initiative_state = initiative_state ? JSON.parse(initiative_state) : {}

    return this.setState({ ...initiative_state})
  }


  // sets the ref of a particular row / column of the refMatrix
  mapRef(id) {
    const { refMatrix } = this.state;
    const _this = this;

    return function(ref) {
      if(!ref) return null;
      if(!refMatrix[id]) refMatrix[id] = {}
      refMatrix[id][ref.name] = ref;
      _this.setState({ refMatrix })
    }
  }

  changeFocus(id, direction = true, name = 'initiative') {
    const { refMatrix, order } = this.state
    let selectedRow

    // TODO: wrapping focus traversal
    // if the result of the ref reducer is just an id, then the entire order was traversed without
    // finding the desired row; 
    // either firstmost node traversing up or last node traversing down:
    //
    // return the id corresponding to the adjacent row, based on the current order
    let ref = order.reduce((a,b) => {
      // if reduciton has returned a reference, return it
      if(a && a.focus) return a;


      if(direction) {
        // if a matches the id, then b is the targeted id
        if(a === id) return refMatrix[b][name]
      } else {
        // traversing up from the first row: return the last entry
        if(a === id) return refMatrix[order[order.length-1]][name]
        // if a matches the id, then b is the targeted id
        // if b matches the id, then a is the targeted id
        if(b === id) return refMatrix[a][name]
      }
      return b
    })

    if(!ref.focus) ref = refMatrix[order[0]][name]

    if(ref && ref.focus) ref.focus();
    if(ref && ref.select) return ref.select();
    return ref;
  }


  // moves the cursor to the next initiative in order
  incrementCursor() {
    let { creatures, order, cursor, round } = this.state

    // construct the list of valid participants:
    //  1. map the 'order' array to the creatures object
    //  2. filter out invalid actors (dying, etc)
    creatures = order
      .map(id => creatures[id])
      .filter(creature => creature.currentHP >= 0)

    // exhausted is true if the entire creatures array can be reduce
    // an empty creatures array defaults to exhausted
    // any creature with an initiative lower than the cursor should make this false
    let exhausted = creatures.reduce((a,b) => a && !((b.initiative < cursor) && (b.initiative > -Infinity)), true)

    if(exhausted) {
      cursor = Math.max.apply(null, creatures.map(creature => creature.initiative));
      round++;
      return this.setState({cursor, round})
    } else {
      for(let c in creatures) {
        if(creatures[c].initiative < cursor) {
          cursor = creatures[c].initiative
          return this.setState({cursor})
        }
      }
    }
  }

  // adds a blank creature to the initiative list
  addCreature() {
    let { creatures, system } = this.state
    let uid
    do {
      uid = generateGuid();
    } while(uid in creatures) 

    let creature = {
      id: uid,
      label: '',
      // initiative: Math.floor(Math.random() * 20),
      initiative: -Infinity,
      faction: 'neutral',
      /*
      ac: 0,
      cr: 1,
      */
      currentHP: 0,
      creature: new system.Creature()
    }

    this.setState({
      creatures: {
        ...creatures,
        [uid]: creature
      }
    })
  }

  cloneCreature(id) {
    let { creatures, system } = this.state
    // let id = event.currentTarget.value

    let uid;
    do {
      uid = generateGuid();
    } while(uid in creatures)

    let clonedCreature = Object.assign({}, creatures[id])
    clonedCreature.id = uid;

    this.setState({
      creatures: {
        ...creatures,
        [uid]: clonedCreature
      }
    })
  }

  // removes an entry from initiative
  removeCreature(id) {
    let { creatures, system } = this.state
    // let id = event.currentTarget.value

    this.changeFocus(id)

    this.setState({
      creatures: {
        ...creatures,
        [id]: undefined
      }
    });
  }


  updateCreature(id, modification = false) {
    return function(event) {
      let { creatures } = this.state;
      let { value, name, type } = event.target;
      let creature = _.cloneDeep(creatures[id])

      if(creature) {
        if(type === 'number' && value !== '') {
          value = Number(value)
          if(modification) _.set(creature, name, _.get(creature, name) + value)
        }
        if(!modification) _.set(creature, name, value)
      }

      if(modification) event.currentTarget.value = ''

      this.setState({
        creatures: {
          ...creatures,
          [id]: creature
        }
      });
    }.bind(this)
  }

  getInitiativeOrder(creatures) {

    let order = Object.keys(creatures).filter(key => creatures[key]).sort((a,b) => {
      if(creatures[b] && creatures[a]) {
        if(creatures[b].initiative - creatures[a].initiative) return creatures[b].initiative - creatures[a].initiative
        if(creatures[a].faction >= creatures[b].faction) {
          if(creatures[a].faction !== creatures[b].faction) return 1;
          if(creatures[b].label) return creatures[a].label.toLowerCase() > creatures[b].label.toLowerCase()
          if(creatures[b].id) return creatures[a].id > creatures[b].id
        }
      }
      return -1 
    })

    return order
  }

  render() {
    let error 
    const { match: {params: {system} } } = this.props
    const { cursor, round, system: System } = this.state

    // console.log(Systems, System, system)
    if(!System) error = new Error(`${system} is not a supported rules system`)

    if(error) {
      error.status = error.status || 400
      return <ErrorPage error={error}/>
    }

    // const Creature = System.Creature
    // const CreatureSchema = Creature.schema.toJSON()
    // convert the creatures in state to the system's Creature object
    let { creatures, order } = this.state
    // const { Quantifiable: {list: Quantifiable} } = System

    // TODO: add system configuration for the particular fields accessible in Initiative tool
    // TODO: summarize data

    let experience = 0
    let allies = 0
    let cr

    for(let id in creatures) {
      let creature = creatures[id]
      if(creature && ![-Infinity, '', null].includes(creature.initiative)) {
        if(creature.faction === 'hostile') experience += Experience[creature.creature.cr] || 0
        if(['ally', 'friendly'].includes(creature.faction)) allies++
      }
    }

    Object.keys(Experience)
    .sort((a,b) => Experience[a] - Experience[b])
    .reduce((a,b) => {
      if(cr) return;
      if(experience <= Experience[b]) cr = b
      return b
    }, null)

    let experiencePer = allies && Math.floor(experience/allies / 50) * 50

    return (
      <div className="flex vert fill grow">
        <div className="flex horz no-size">
          <div className="flex horz pad">
            <button className="btn" onClick={this.addCreature}>Add Creature</button>
            <button className="btn" onClick={this.incrementCursor}>Next</button>
            <button className="btn" onClick={this.reset}>Reset</button>
            <button className="btn" onClick={this.saveLocal}>Save</button>
            <button className="btn" onClick={this.restoreLocal}>Load</button>
          </div>
          <div className="flex vert grow">
            <table className="fixed">
              <thead>
                <tr>
                  <td>Creatures</td>
                  <td>Initiative</td>
                  <td>Round</td>
                  <td>CR</td>
                  <td>EXP</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{order.length}</td>
                  <td>{cursor}</td>
                  <td>{round}</td>
                  <td>{cr || <i className="fa fa-exclamation-triangle"/>}</td>
                  <td className="flex horz distribute">
                    <span>{experience ? experience.toLocaleString() : '—'}</span>
                    { experiencePer ? <span>{`(${experiencePer})`}</span> : null}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <InitiativeTable system={System}>
          {order.map((id, i) => creatures[id] &&
            <CreatureRow 
              index={i} 
              key={id} 
              creature={creatures[id]} 
              highlighted={cursor === creatures[id].initiative} 
              system={System} 

              mapRef={this.mapRef}
              changeFocus={this.changeFocus}
              incrementCursor={this.incrementCursor}
              cloneCreature={this.cloneCreature}
              removeCreature={this.removeCreature} 
              updateCreature={this.updateCreature} 

            />)}
        </InitiativeTable>
      </div>
    )
  }
}

Initiative.propTypes = { }

const mapStateToProps = ({session}) => session

export default withRouter(connect(mapStateToProps)(Initiative))
