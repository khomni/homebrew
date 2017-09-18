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
    let search = '';
    if(event) search = event.target.value;
    this.delay = setTimeout(() => {
      let body = {n: this.props.limit || 10}
      body[this.props.searchKey] = search
      return Ajax.json({url: this.props.action, method:'get', body})
      .then(data => {
        this.setState({characters: data});
      })
    }, 200)

  }

  componentDidMount() {
    this.handleChange();
  
  }

  componentWillUnmount() {
    clearTimeout(this.delay);
  }

  render() {
    let {search, characters} = this.state;
    let {action, searchKey, inputType, placeholder, method, limit} = this.props;

    return (<div>
      <input type="text" className="form-input" name={searchKey} placeholder={placeholder} method={method} onChange={this.handleChange}/>
      <div className="flex vert pad">
        {characters.map(character => {

          if(!inputType) return <button name="id" className="btn" value={character.id}>{character.name}</button>

          if(['checkbox','radio'].includes(inputType.toLowerCase())) {
            return <label className={inputType} key={character.id}>
              <input type={inputType} name="id" value={character.id} />
              <span>{character.name}</span>
            </label>
          }

          return <label className={inputType} key={character.id}>
            <input type={inputType} name="id" value={character.id} />
            <span>{character.name}</span>
          </label>

        })}
      </div>
    </div>)
  }
}



