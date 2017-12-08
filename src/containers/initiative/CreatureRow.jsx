import React from 'react';
import _ from 'lodash';

import { HealthBar, SystemFields } from '../../components/tools/Initiative';

export default class CreatureRow extends React.Component {

  constructor(props) {
    super(props);
    this.toggleFocus = this.toggleFocus.bind(this);
    this.updateCreature = props.updateCreature(props.creature.id);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.state = { focused: false }
  }

  handleKeyDown(event) {
    const { index, system, cloneCreature, removeCreature, changeFocus, creature: { id } } = this.props;
    const { currentTarget: { name }, shiftKey, ctrlKey, keyCode } = event

    if(ctrlKey) {
      switch(keyCode) {
        case 8:
        case 46:
          event.preventDefault();
          return removeCreature(id);
        case 13:
          event.preventDefault();
          return cloneCreature(id);
      }
    }

    let direction = !shiftKey
    if(event.keyCode === 13) {
      event.preventDefault();
      return changeFocus(id, direction, name)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { creature, highlighted } = this.props
    const { focused } = this.state
    const nextCreature = nextProps.creature

    if(nextState.focused !== focused) return true
    if(nextProps.highlighted !== highlighted) return true
    // TODO: deep equals
    return !_.isEqual(creature, nextCreature)
  }

  toggleFocus() {
    const { focused } = this.state

    this.setState({focused: !focused})
  }


  render() {
    const { index, highlighted, system, creature, removeCreature, cloneCreature} = this.props;
    const { focused } = this.state
    let rowClasses = []
    let mapRef = this.props.mapRef(creature.id);

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
      <td className="top">
        <div className="flex row pad">
          <button className="as-link close" value={creature.id} onClick={() => removeCreature(creature.id)} alt="Remove"/>
          <button className="as-link close" value={creature.id} onClick={this.toggleFocus} alt="Focus">
            <i className={`fa fa-${focused ? 'minus' : 'plus'}-square`}/>
          </button>
          <button className="as-link close" value={creature.id} onClick={() => cloneCreature(creature.id)} alt="Clone">
            <i className="fa fa-clone"/>
          </button>
        </div>
      </td>
    )

    const hpBar = (
      <HealthBar current={creature.hpCurrent} max={creature.hpMax}>
        <div className="flex row center">
          <input className="inline right" type="number" name="hpCurrent" value={creature.hpCurrent} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
          <div>/</div>
          <input className="inline left" type="number" name="hpMax" value={creature.hpMax} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
        </div>
      </HealthBar>
    )

    let Quantifiable = system.Quantifiable.list.keys;
    let fields = system.Creature.schema.toJSON().properties
    // console.log(fields)


    if(focused) return (
      <tr className={rowClasses.join(' ')}>
        { controls }
        <td colSpan="7">
          { hpBar }
          <pre>
            {JSON.stringify(creature.creature, null, '  ')}
          </pre>
            <SystemFields fields={fields} baseName='creature' baseObject={creature} onChange={this.updateCreature}/>
        </td>
      </tr>
    )

    // TODO: construct creature row columns based on System configuration settings
    //          this should let the fields be constructed dynamically according to a set number of rules

    return (
      <tr className={rowClasses.join(' ')}>

        { controls }

        <td><label>{creature.id}</label></td>

        <td>
          <input className="inline right" type="number" name="initiative" value={creature.initiative === -Infinity ? '' : creature.initiative} ref={mapRef} onChange={this.updateCreature} onKeyDown={this.handleKeyDown}/>
        </td>

        <td>
          <select className="inline right" name="faction" onChange={this.updateCreature} value={creature.faction} ref={mapRef} onKeyDown={this.handleKeyDown}>
            <option>neutral</option>
            <option>ally</option>
            <option>hostile</option>
            <option>friendly</option>
          </select>
        </td>

        <td>
          <input className="inline fill left" name="label" value={creature.label} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
        </td>

        <td>
          <input className="inline right" type="number" name="ac" value={creature.ac} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
        </td>

        <td>{ hpBar }</td>

      </tr>
    )
  }
}

