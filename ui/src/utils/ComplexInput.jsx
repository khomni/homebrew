import React, { Component } from 'react';
import _ from 'lodash';

/* ==============================
 * ComplexInput: creates form inputs for complex data types: Arrays and Objects
 *      value: default value (i.e. pre-existing data from the database
 *      template: a schema that describes the form element(s) that make up parts of the data
 *
 * 1. Supports arbitrary nesting of complex types (arrays of objects, arrays in objects, etc)
 * 2. implements UI for adding or removing elements from arrays
 * ============================== */

export default class ComplexInput extends Component {
  constructor(props) {
    super(props);
    this.removeValue = this.removeValue.bind(this);
    this.addValue = this.addValue.bind(this);
    this.handleSubChange = this.handleSubChange.bind(this);

    let { value } = this.props;
  }

  removeValue(e) {
    let { name, template, handleChange, value} = this.props
    let index = e.target.value;
    value.splice(index, 1);

    return handleChange({[name]: value})
    // this.setState({value})
  }

  // values are only added when the ComplexInput is of the array variety
  // the template item should be crawled so that all defaults are returned
  addValue(e) {
    let { name, template, handleChange, value} = this.props

    // let defaults = _.cloneDeepWith(template, t => 'default' in t)
    let defaults = _.cloneDeepWith(template, t => {
      if('default' in t) return t.default
    })

    // TODO: templates
    value.push(defaults);
    // this.setState({value})
    handleChange({[name]: value})
  }

  handleSubChange(e) {
    // send the entire data structure back
    const { name, handleChange, value } = this.props

    if(e.target) return handleChange({[name]: e.target.value})
    Object.assign(value, e)
    return handleChange({[name]: value})
  }


  render() {
    const { template, handleChange } = this.props
    const { value } = this.props

    // ComplexInput::Array
    // nest a ComplexInput for each element in the array using the template in props
    // provide an X button to remove elements, and a + element to clone new elements
    // cloned elements will use the template to determine their default value
    if(Array.isArray(value)) return (
      <div className="flex border pad vert grow">
        {value.map((v,i) => (
          <div className="flex input-group horz grow" key={i}>
            <ComplexInput name={i} value={v} template={template} handleChange={this.handleSubChange}/>
            <div className="flex center">
              <a className="close" value={i} onClick={this.removeValue}/>
            </div>
          </div>
        ))}
        <a className="btn" onClick={this.addValue}>Add</a>
      </div>
    )

    // ComplexInput::Object
    // nest a ComplexInput for each element in the value object
    // refer to the template key for the nested item's template
    if(typeof value === 'object') return (
      <div className="flex border pad horz grow">
        {Object.keys(value).map((key,i) => (
          <ComplexInput name={key} key={key} value={value[key]} template={template[key]} handleChange={this.handleSubChange}/>
        ))}
      </div>)

    // ComplexInput:: Default
    // template must contain accurate information to populate this element
    return (
      <div className="flex grow">
        <input className="form-input" value={value} onChange={this.handleSubChange} { ...template }/>
      </div>
    )
  }
}

