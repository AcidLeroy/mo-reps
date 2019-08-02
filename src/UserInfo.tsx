import React, { Component } from 'react';

interface Props {
  user: {
    image: {contentUrl: string}[], 
    name: string
  }
}

class UserInfo extends Component<Props, {}> {
  constructor(props: Readonly<Props>) {
    super(props)
  }

  render() {
    return (
      <div >
        <img src={
            this.props.user && this.props.user.image
              ? this.props.user.image[0].contentUrl
              : "/noprofilepicture.png"
          } />
        <h1>{this.props.user && this.props.user.name}</h1>
      </div>
    )
  }
}

export default UserInfo;