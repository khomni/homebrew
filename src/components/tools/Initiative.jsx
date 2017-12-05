import React from 'react';
import _ from 'lodash';

const Initiative = ({system, children}) => (
  <div className="scroll x">
    <table className="monospace fixed">
      <colgroup>
        <col className="small"/>
        <col className="small"/>
        <col className="small"/>
        <col className="small"/>
        <col className="small"/>
        <col className="small"/>
        <col className="large"/>
      </colgroup>
      <thead>
        <tr>
          <th/>
          <th>id</th>
          <th>Initiative</th>
          <th>Faction</th>
          <th>Label</th>
          <th>AC</th>
          <th>HP</th>
        </tr>
      </thead>
      <tbody>
        { children }
      </tbody>
    </table>
  </div>
)

export default Initiative


export class CreatureRow extends React.Component {

  constructor(props) {
    super(props);
    this.toggleFocus = this.toggleFocus.bind(this)
    this.updateCreature = props.updateCreature(props.creature.id)

    this.state = { focused: false }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { creature, highlighted } = this.props
    const { focused } = this.state
    const nextCreature = nextProps.creature

    if(nextState.focused !== focused) return true
    if(nextProps.highlighted !== highlighted) return true
    return !_.isEqual(creature, nextCreature)
  }

  toggleFocus() {
    const { focused } = this.state

    this.setState({focused: !focused})
  }


  render() {
    const {highlighted, system, creature, removeCreature, cloneCreature} = this.props;
    const { focused } = this.state
    let rowClasses = []

    if(highlighted) rowClasses.push('active')
    if(creature.initiative === -Infinity || creature.initiative === '') rowClasses.push('disabled')
    if(creature.hpCurrent < 0) rowClasses.push('dying')

    switch (creature.faction) {
      case 'ally': 
        rowClasses.push('green')
        break;
      case 'neutral':
        rowClasses.push('gray')
        break;
      case 'friendly':
        rowClasses.push('blue')
        break;
      case 'hostile': 
        rowClasses.push('red')
        break;
    }

    const controls = (
      <td>
        <div className="flex row pad">
          <button className="as-link close" value={creature.id} onClick={removeCreature} alt="Remove"/>
          <button className="as-link close" value={creature.id} onClick={this.toggleFocus} alt="Focus">
            <i className={`fa fa-${focused ? 'minus' : 'plus'}-square`}/>
          </button>
          <button className="as-link close" value={creature.id} onClick={cloneCreature} alt="Clone">
            <i className="fa fa-clone"/>
          </button>
        </div>
      </td>
    )

    const hpBar = (
      <div className="bar">
        <div className="hilt" style={{width: '100px'}}>
          <div className="flex row center">
            <input className="inline right" type="number" name="hpCurrent" value={creature.hpCurrent} onChange={this.updateCreature}/>
            <div>/</div>
            <input className="inline left" type="number" name="hpMax" value={creature.hpMax} onChange={this.updateCreature}/>
          </div>
        </div>
        <div className="data-bar red">
          <div className="value" style={{width: `${100 * (creature.hpCurrent/creature.hpMax) || 0}%`}}>
            <span>{creature.hpMax ? `${Math.floor(10000 * (creature.hpCurrent / creature.hpMax)) / 100}%` : '–'}</span>
          </div>
        </div>
      </div>
    )

    if(focused) return (
      <tr>
        { controls }
        <td><label>{creature.id}</label></td>
        <td colSpan="6">
          { hpBar }
        </td>
      </tr>
    )

    return (
      <tr className={rowClasses.join(' ')}>

        { controls }

        <td><label>{creature.id}</label></td>

        <td>
          <input className="inline right" type="number" name="initiative" value={creature.initiative === -Infinity ? '' : creature.initiative} onChange={this.updateCreature}/>
        </td>

        <td>
          <select className="inline right" name="faction" onChange={this.updateCreature} value={creature.faction}>
            <option>neutral</option>
            <option>ally</option>
            <option>hostile</option>
            <option>friendly</option>
          </select>
        </td>

        <td>
          <input className="inline fill left" name="label" value={creature.label} onChange={this.updateCreature}/>
        </td>

        <td>
          <input className="inline right" type="number" name="ac" value={creature.ac} onChange={this.updateCreature}/>
        </td>

        <td>{ hpBar }</td>

      </tr>
    )
  }
}
