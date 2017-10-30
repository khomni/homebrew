import React from 'react';
import { render } from 'react-dom';

import Form from '../../utils/form'
import ComplexInput from '../../utils/ComplexInput.jsx'

const template = {
  weekdays: {
    name: 'weekdays',
    placeholder: 'Name of Weekday',
    type: 'text',
    default: '',
  },
  months: {
    name: { 
      name: 'name',
      placeholder: 'Name of Month',
      type: 'text',
      default: '', 
    },
    days: { 
      name: 'days',
      placeholder: 'Days in Month',
      type: 'number',
      min: 1,
      default: 30 
    }
  }
}

class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    console.log(this.props.calendar);

    this.state = {
      calendar: this.props.calendar || {weekdays:[''], months:[{name: '', days:30}]}
    }
  }

  handleChange(state) {
    let { calendar } = this.state

    Object.assign(calendar, state);
    this.setState({calendar});
  }

  render() {
    const { match } = this.props;
    const { calendar } = this.state;
    const { weekdays, months } = calendar || {};

    return (
      <Form action={match.url} body={calendar} method="post">
        <h2>Edit</h2>

        <div className="flex pad vert">
          <label>Weekdays</label>
          <ComplexInput value={weekdays} name="weekdays" template={template.weekdays} handleChange={this.handleChange}/>
        </div>

        <div className="flex pad vert">
          <label>Months</label>
          <ComplexInput value={months} name="months" template={template.months} handleChange={this.handleChange}/>
        </div>

        <button className="btn">Submit</button>

        <pre>{JSON.stringify(match, null, '  ')}</pre>
        <pre>{JSON.stringify(this.state, null, '  ')}</pre>

      </Form>
    
    )
  }
}

export default Edit
