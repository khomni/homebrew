import React from 'react'

export default class Navlink extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      expanded: false
    }
  }

  handleClick(event){
    if(this.props.handleClick) {
      event.preventDefault();
      return this.props.handleClick(event)
    }
  }

  handleMouseEnter(event){
    this.setState({expanded:true});
  }

  handleMouseLeave(event) {
    this.setState({expanded:false});
  }

  render() {
    return <a href={this.props.href} className="navlink" onClick={this.handleClick}>
      {this.props.label}
    </a>
  }

}
