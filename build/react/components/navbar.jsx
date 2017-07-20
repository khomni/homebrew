import React from 'react';

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <nav className="navigation">
      {this.props.user && <div>{this.props.user.username}</div>}
      {this.props.character && <div>{this.props.character.name}</div>}
      {this.props.campaign && <div>{this.props.campaign.name}</div>}
    </nav>

  }
}
