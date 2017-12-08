import React from 'react';
import _ from 'lodash';

// TODO: construct table columns based on System configuration settings

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


/* ============================== 
 * HealthBar: displays a bar based on a maximum and current value 
 *      child elements are placed inside the hilt of the s
 * ============================== */

const RGB_MAX = 200

export const HealthBar = ({ current, max, children }) => {

  let percentage = (100 * (current / max || 0))

  const red = Math.floor( Math.min(Math.log10( Math.max(1, (100 - percentage)/ 10)) * RGB_MAX), RGB_MAX)
  const green = Math.floor( Math.min(RGB_MAX, Math.log10(Math.max(1, percentage/10)) * RGB_MAX ))
  const blue = 25

  let backgroundColor = `rgb(${red},${green},${blue})`
  
  return (
    <div className="bar">
      { children && (
        <div className="hilt" style={{width: '100px'}}>
          { children }
        </div>
      )}
      <div className={`data-bar`}>
        <div className="value" style={{backgroundColor, width: `${percentage || 0}%`}}>
          <span>{max ? `${Math.floor(10 * percentage) / 10}%` : '–'}</span>
        </div>
      </div>
    </div>
  )
}

export const SystemFields = ({row = false, baseName, baseObject, fields, children, ...props}) => {
  console.log('systemFields render');
  
  return (
    <div className={`flex vert pad border`}>
      { children }
      <div className={`flex horz pad`}>
        { Object.keys(fields).map(key => {
          let field = fields[key]
          let name = `${baseName}.${key}`
          if('properties' in field) return (
            <div className="flex vert" key={key}>
              <SystemFields row={!row} baseObject={baseObject} baseName={name} fields={field.properties} {...props}>
                <label>{key}</label>
              </SystemFields>
            </div>
          )
          return (
            <div className="flex vert pad" key={key}>
              <label>{key}</label>
              { 'enum' in field ? (
                <select className="inline left" name={name} value={_.get(baseObject, name)} {...props}>
                  <option value=''>—</option>
                  { field.enum.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input 
                  className="inline left" 
                  type={field.type === 'number' ? 'number' : 'text'} 
                  name={name} 
                  value={_.get(baseObject, name)}

                  min={field.minimum}
                  max={field.maximum}

                  {...props} 
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Initiative
