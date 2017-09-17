import React from 'react';

import onXhrContentLoad from '../../../dataemissions';

import Ajax from '../../../ajax';
import Promise from 'bluebird';

global.Ajax = Ajax;
global.Promise = Promise;

export default class CharacterSearch extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      search: '',
      characters: [],
    }
  }

  handleChange(event) {
    clearTimeout(this.delay);
    let search = event.target.value;
    this.delay = setTimeout(() => {
      let body = {n: 10}
      body[this.props.searchKey] = search
      return Ajax.json({url: this.props.action, method:'get', body})
      .then(data => {
        this.setState({characters: data});
      })
    }, 200)

  }

  componentWillUnmount() {
    clearTimeout(this.delay);
  }

  render() {
    let {search, characters} = this.state;
    let {action, searchKey, inputType, placeholder, method, limit} = this.props;

    return <div>
      <input type="text" className="form-input" name={searchKey} placeholder={placeholder} method={method} limit={limit} onChange={this.handleChange}/>
      <div className="flex vert pad">
        {characters.map(character => {
          return <label className={inputType} key={character.id}>
            <input type={inputType} name="id" value={character.id} />
            <span>{character.name}</span>
          </label>
        })}
      </div>
    </div>
  }
}



