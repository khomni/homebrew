import React from 'react';
import _ from 'lodash';

const Initiative = ({system, children}) => (
  <table className="monospace fixed">
    <colgroup>
      <col className="small"/>
      <col className="small"/>
      <col className="small"/>
      <col className="small"/>
      <col/>
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
)

export default Initiative


export class CreatureRow extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    const { creature } = this.props
    const nextCreature = nextProps.creature

    return !_.isEqual(creature, nextCreature)
  }

  render() {
    const {highlighted, system, creature, removeCreature, updateCreature, cloneCreature} = this.props;
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

    console.log(creature, rowClasses)

    return (
      <tr className={rowClasses.join(' ')}>

        <td>
          <div className="flex row pad">
            <button className="as-link close" value={creature.id} onClick={removeCreature} alt="Remove"/>
            <button className="as-link close" value={creature.id} onClick={cloneCreature} alt="Clone">
              <i className="fa fa-clone"/>
            </button>
          </div>
          </td>

        <td><label>{creature.id}</label></td>

        <td>
          <input className="inline right" type="number" name="initiative" value={creature.initiative === -Infinity ? '' : creature.initiative} onChange={updateCreature(creature.id)}/>
        </td>

        <td>
          <select className="inline right" name="faction" onChange={updateCreature(creature.id)} value={creature.faction}>
            <option>neutral</option>
            <option>ally</option>
            <option>hostile</option>
            <option>friendly</option>
          </select>
        </td>

        <td>
          <input className="inline fill left" name="label" value={creature.label} onChange={updateCreature(creature.id)}/>
        </td>

        <td>
          <input className="inline right" type="number" name="ac" value={creature.ac} onChange={updateCreature(creature.id)}/>
        </td>

        <td>
          <div className="bar">
            <div className="hilt" style={{width: '100px'}}>
              <div className="flex row center">
                <input className="inline right" type="number" name="hpCurrent" value={creature.hpCurrent} onChange={updateCreature(creature.id)}/>
                <div>/</div>
                <input className="inline left" type="number" name="hpMax" value={creature.hpMax} onChange={updateCreature(creature.id)}/>
              </div>
            </div>
            <div className="data-bar red">
              <div className="value" style={{width: `${100 * (creature.hpCurrent/creature.hpMax) || 0}%`}}>
                <span>{creature.hpMax ? `${Math.floor(10000 * (creature.hpCurrent / creature.hpMax)) / 100}%` : '–'}</span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    )
  }
}
