import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Icon } from 'native-base';
import { GiftedChat } from 'react-native-gifted-chat';
import Expo from 'expo';

let window = Dimensions.get('window');
const contentHeight = window.height - 80;

//if we have some icon of the user we can change according to that
const avatarBot = "https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg";

export default class GiftedChatApp extends Component {
  static navigationOptions = {
    title: 'ChatBot'
  }

  state = {
    gifted: [], 
    answers: [], 
    height: contentHeight
  }

  componentDidMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    Expo.Speech.stop();
  }

  _keyboardDidShow = (e) => {
    this.setState({ height: contentHeight - e.endCoordinates.height});
    // console.log(this.state.contentHeight, 'Keyboard Shown');
  }

  _keyboardDidHide = (e) => {
    this.setState({ height: contentHeight });
    // console.log(this.state.contentHeight, 'Keyboard Hidden');
  }

  componentWillMount() {
    this.setState({
      gifted: [
        {
          _id: 1,
          text: 'Gender',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'name',
            avatar: avatarBot,
          },
        },
        {
          _id: 2,
          text: 'All your information kept private!!',
          createdAt: new Date(),
          user: {
            _id: 3,
            name: 'info',
            avatar: avatarBot,
          },
        },
        {
          _id: 4,
          text: 'Tell us more about you ?',
          createdAt: new Date(),
          user: {
            _id: 5,
            name: 'data',
            avatar: avatarBot,
          },
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      gifted: GiftedChat.append(previousState.gifted, messages),
    }))
    this.getDialogFlow(messages[0].text)
  }

  async getDialogFlow(msg) {
    const ACCESS_TOKEN = 'TOKEN_FROM_DIALOGFLOW';

    try {
       const response = await fetch(`https://app.meetuniversity.com/Api_new/getaccessToken?projectID=test-nuycia&client_id=mu_internal&key=0a19a3edd791626cca1fe1a33f2f2dba',`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'text/plain; charset=UTF-8',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          dataType: "jsonp",
          crossDomain: true,
          async:false,
          success: function(data) {
          accessToken= data.token;
          //console.log(accessToken);
          }
        },
        body: JSON.stringify({
          query: msg,
          lang: 'en',
          // sessionId: 'somerandomthing'
        })
      })
      let responseJson = await response.json();

      const imageUrl = null;

      responseJson.result.fulfillment.messages.map((item, i) => {
         if (item.payload !== undefined){
            if(item.payload.imageUrl !== undefined) {
              imageUrl = item.payload.imageUrl;
            }
        }
        return imageUrl
      })

      let answers = [
        {
          _id: responseJson.id,
          text: responseJson.result.fulfillment.speech,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Botler',
            avatar: avatarBot,
          },
          image: imageUrl,
          imageProps: {
             height: 200,
             width: 200
          }
        },
      ]

      Expo.Speech.stop()
      Expo.Speech.speak(responseJson.result.fulfillment.speech)

      this.setState(previousState => ({
        gifted: GiftedChat.append(previousState.gifted, answers),
      }))

      return responseJson;

    } catch(error) {
      console.error(error);
    }
  }

  renderChat = () => {
    return(
        <GiftedChat
          textInputProps={{autoFocus: true}}
          messages={this.state.gifted}
          placeholder='Ask me anything...'
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
    );
  }

  render() {
    if(Platform.OS === 'ios'){
      return this.renderChat();
     }
    else{
       return(
        <View style={{ height: this.state.height }}>
           { this.renderChat() }
        </View>
      )
    }
  }
}