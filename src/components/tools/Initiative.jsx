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
    this.toggleFocus = this.toggleFocus.bind(this);
    this.updateCreature = props.updateCreature(props.creature.id);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.state = { focused: false }
  }

  handleKeyDown(event) {
    const { index, cloneCreature, removeCreature, changeFocus, creature: { id } } = this.props;
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
      <td>
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

    let hpPercentage = (100 * (creature.hpCurrent / creature.hpMax || 0))
    const RGB_MAX = 200

    // TODO: use logarithmic equations rather than linear

    let barColors = {
      red: Math.floor( Math.min(Math.log10( Math.max(1, (100 - hpPercentage)/ 10)) * RGB_MAX), RGB_MAX),
      green: Math.floor( Math.min(RGB_MAX, Math.log10(Math.max(1, hpPercentage/10)) * RGB_MAX )),
      blue: 25,
    }

    let backgroundColor = `rgb(${barColors.red},${barColors.green},${barColors.blue})`

    const hpBar = (
      <div className="bar">
        <div className="hilt" style={{width: '100px'}}>
          <div className="flex row center">
            <input className="inline right" type="number" name="hpCurrent" value={creature.hpCurrent} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
            <div>/</div>
            <input className="inline left" type="number" name="hpMax" value={creature.hpMax} onChange={this.updateCreature} ref={mapRef} onKeyDown={this.handleKeyDown}/>
          </div>
        </div>
        <div className={`data-bar`}>
          <div className="value" style={{backgroundColor, width: `${hpPercentage || 0}%`}}>
            <span>{creature.hpMax ? `${Math.floor(10 * hpPercentage) / 10}%` : '–'}</span>
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
          <pre>
            {JSON.stringify(creature.creature, null, '  ')}
          </pre>
        </td>
      </tr>
    )

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
