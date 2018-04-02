import React from 'react'

export default class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.toggleDropdownState = this.toggleDropdownState.bind(this);

    this.state = {
      expanded: false
    }
  }

  toggleDropdownState(){
    this.setState({expanded: !this.state.expanded});
  }

  handleMouseEnter(event){
    this.setState({expanded:true});
  }

  handleMouseLeave(event) {
    // this.setState({expanded:false});
  }

  render() {
    return <div className={this.state.expanded ? "dropdown active" : "dropdown"}
    onClick={this.toggleDropdownState}
    onMouseEnter={false && this.handleMouseEnter}
    onMouseLeave={this.handleMouseLeave}>
      <label className="dropdown-label">
        { this.props.image && (
          <div className="dropdown-image">
            <img src={this.props.image} />
          </div>
        )}
        {this.props.label}
      </label>
      <div className={`dropdown-menu ${this.state.expanded ? 'active' : ''}`}>
        {this.props.children}
      </div>
    </div>
  }

}
