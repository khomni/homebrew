import React, { Component } from 'react';

import generateGuid from '../utils/guid'
import ErrorView from '../components/Error.jsx'

/* ==============================
 * ErrorList:
 *      manages a list of errors, allowing auto-hide and manual hiding
 * ============================== */

export class ErrorList extends Component {
  constructor(props) {
    super(props);
    this.hideError = this.hideError.bind(this);

    // all errors
    this.state = { 
      errors: {}, // keyed list of all errors
      orderedList: [], // updated when props are changed or elements are hidden
    }
  }

  hideError(id) {
    const { errors } = this.state;

    let thisError = errors[id];
    if(!thisError) return;

    clearTimeout(thisError.timer);
    thisError.hidden = true;
    errors[id] = thisError;

    this.setState({errors})
  }

  componentWillMount() {
    const {errors: propErrors} = this.props;

    let { errors } = this.state;

    propErrors.forEach(error => {
      errors[error.id] = error
    })
    // only initialize the errors from the state on mount;
    //  further changes to errors prop should consult the state to make sure hidden errors stay hidden
    this.setState({errors})
  }

  // if an errorlist receives a new errors parameter, we have to make sure that errors
  //    that have already been hidden continue to be hidden
  componentWillReceiveProps(nextProps) {
    const { autoHide } = this.props;
    const { errors } = this.state;
    const { errors: nextErrors } = nextProps

    // if the number of errors has not changed, do not recalculate error list
    // if(nextErrors.length === Object.keys(errors).length) return true;

    // reinitialize the ordered list
    let orderedList = [];

    // use the inherited list to update the existing state storage
    nextErrors.forEach(error => {
      let {id} = error;
      // add new errors to the cache, as necessary
      if(!errors[error.id]) errors[id] = error; 
    
      // rely on the existing error information to preserve timers, hidden flags, etc
      let thisError = errors[id]

      if(!thisError.hidden) {
        // if autohide property is enabled, set this error to be hidden after the interval
        if(autoHide && !thisError.timer) thisError.timer = setTimeout((preservedId => () => this.hideError(preservedId))(id), autoHide)

        orderedList.push(thisError)
      }
    })
    // sort by error time
    orderedList = orderedList.sort((a,b) => a.timestamp - b.timestamp)

    this.setState({orderedList})
  
  }

  render() {
    const { orderedList: errors } = this.state

    return (
      <div>
        {errors.filter(error => !error.hidden).map(error => <ErrorView hideError={this.hideError} key={error.id} error={error} {...this.props}/>)}
      </div>
    )
  
  }
}

/* ==============================
 * ErrorContainer:
 *      renders an appropriate error object
 * ============================== */

export default class ErrorContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { error } = this.props;

    return <ErrorView error={error}/>
  
  }

}

