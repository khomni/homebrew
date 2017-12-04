import React from 'react';

const Initiative = ({system, children}) => (
  <table className="monospace fixed">
    <colgroup>
      <col className="small"/>
      <col className="small"/>
      <col className="small"/>
      <col className="small"/>
      <col/>
      <col className="large"/>
    </colgroup>
    <thead>
      <tr>
        <th/>
        <th>id</th>
        <th>Initiative</th>
        <th>Faction</th>
        <th>Label</th>
        <th>HP</th>
      </tr>
    </thead>
    <tbody>
      { children }
    </tbody>
  </table>
)

export default Initiative

export const CreatureRow = ({highlighted, system, creature, removeCreature, updateCreature}) => {

  let rowClasses = []

  if(!highlighted || creature.initiative === -Infinity || creature.hp.current < 0) rowClasses.push('disabled')

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

  return (
    <tr className={rowClasses.join(' ')}>
      <td><button className="as-link close" value={creature.id} onClick={removeCreature}/></td>
      <td><label>{creature.id}</label></td>
      <td>
        <input className="form-input" type="number" name="initiative" value={creature.initiative === -Infinity ? '' : creature.initiative} onChange={updateCreature(creature.id)}/>
      </td>
      <td>
        <select className="form-input" name="faction" onChange={updateCreature(creature.id)} value={creature.faction}>
          <option>neutral</option>
          <option>ally</option>
          <option>hostile</option>
          <option>friendly</option>
        </select>
      </td>
      <td>
        <input className="form-input" name="label" value={creature.label} onChange={updateCreature(creature.id)}/>
      </td>
      <td>
        <div className="flex vert"> 
          <div className="flex row center">
            <input className="inline right" type="number" name="hp.current" value={creature.hp.current} onChange={updateCreature(creature.id)}/>
            <div>/</div>
            <input className="inline right" type="number" name="hp.max" value={creature.hp.max} onChange={updateCreature(creature.id)}/>
          </div>
          <div className="bar">
            <div className="data-bar red">
              <div className="value" style={{width: `${100 * (creature.hp.current/creature.hp.max)}%`}}>
                <span>{`${Math.floor(10000 * (creature.hp.current / creature.hp.max)) / 100}%`}</span>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}
