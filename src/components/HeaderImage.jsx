import React from 'react';

class HeaderImage extends React.Component {
  constructor(props) {
    super(props);
    this.cycleImage = this.cycleImage.bind(this);

    this.state = {
      index: 0
    }
  }

  cycleImage(){
    const { images } = this.props;
    let { index } = this.state;
    index = index++ % images.length
    console.log(index);

    this.setState({index})
  }

  render() {
    const { images, alt } = this.props;
    const { index } = this.state;
    const image = images[index];

    return (
      <div className="header-image" onClick={this.cycleImage}>
        <img key={image.id} src={image.path} alt={alt}/>
      </div>
    )
  }
}

export default HeaderImage

