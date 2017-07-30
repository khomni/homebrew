import React from 'react';
import { render } from 'react-dom';
import ModalForm from '../components/modalform';

export default class Campaign extends React.Component {
  constructor(props) {
    super(props);
    this.handleCharacterMove = this.handleCharacterMove.bind(this);

    this.state = {
    
    }
  }

  // moves the current character to the selected campaign
  handleCharacterMove(campaignId){
    return Ajax.json({
      url: this.props._character.url,
      method: "PATCH",
      body: {
        CampaignId: campaignId || this.props.campaign.id
      }
    })
    .then(json => {
      console.log(json)
    })
  }


  render() {
    // campaign detail
    if(this.props.campaign) return null;

    // campaign list / index
    if(this.props.campaigns) {
      return (
        <div>
          {this.props.campaigns.map(campaign => {
            return (
              <section key={campaign.id}>
                <h2>{campaign.name}</h2> 
              </section>
            )
          })}
        </div>
      )
    };
  };
  
}

