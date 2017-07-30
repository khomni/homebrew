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
    if(this.props.loadView && !this.props.disabled) {
      event.preventDefault();
      return this.props.loadView(this.props.view, this.props.href && {url: this.props.href})
    }
  }

  handleMouseEnter(event){
    this.setState({expanded:true});
  }

  handleMouseLeave(event) {
    this.setState({expanded:false});
  }

  render() {
    return <a href={this.props.href} className="navlink" disabled={this.props.disabled} onClick={this.handleClick}>
      {this.props.children}
    </a>
  }

}
