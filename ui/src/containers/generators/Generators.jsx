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

import Experience from '../../../system/pathfinder/cr';
import { hashString, generators } from '../../../system/generators';
import { magicalItem } from '../../../system/generators/item';

import generateGuid from '../../utils/guid'

class Generators extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      seed: '',
    }
  }

  handleChange(event){

    this.setState({seed: event.target.value.replace(/\s{2,}/,' ')})
  }

  render() {
    const { seed } = this.state
    let argument = {}
    if(seed) argument.seed = hashString(seed)
    let generatedItem = magicalItem.generate(argument)
    // console.log(seed, argument, generatedItem)

    return (
      <div className="container">
        <section>
          <h1>Magic Item Generator</h1>
          <hr/>
            <div className="flex horz pad">
              <input className="form-input" placeholder="Seed" value={seed} onChange={this.handleChange}/>
              <blockquote>
                { generatedItem }
              </blockquote>
            </div>
        </section>
      </div>
    )
  }

}

Generators.propTypes = { }

const mapStateToProps = ({session}) => session

export default withRouter(connect(mapStateToProps)(Generators))
