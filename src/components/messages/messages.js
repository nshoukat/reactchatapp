import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessageHeader from './messageheader'
import MessageForm from './messageform';
import '../../components/App.css';
import firebase from '../../firebase';
import Message from './message';

class Messages extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            messages: [],
            messagesLoading: true,
            privateChannel: this.props.isPrivateChannel,
            user: this.props.currentUser,
            channel: this.props.currentChannel,
            privateMessagesRef: firebase.database().ref('privateMessages'),
            messagesRef:  firebase.database().ref('messages'),
            numUniqueUsers: '',
            searchTerm: '',
            loadingSearch: false,
            searchResults: []
        }
        this.displayMessages = this.displayMessages.bind(this);
    }

    componentDidMount(){
        const {channel, user}= this.state;
        if(channel && user){
            this.addListerners(channel.id);   
        }
    }

    addListerners= channelId => {
        this.addMessageListeners(channelId);
    }

    addMessageListeners= channelId => {
        let loadedMessages= [];
        const ref= this.getMessageRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({messages: loadedMessages, messagesLoading: false});
            this.countUniqueUsers(loadedMessages);
        });
    }

    getMessageRef= () => {
        const {privateChannel, privateMessagesRef, messagesRef}= this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    countUniqueUsers= messages => {
        const  uniqueUsers= messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || !uniqueUsers.length === 0;
        const numUniqueUsers= `${uniqueUsers.length} user${plural ? 's' : ''}`;
        this.setState({ numUniqueUsers });
    }

    displayMessages= messages => (
        messages.length > 0 && messages.map(message => (
            <Message 
                 key={message.timestamp}
                 message={message}
                 user={this.state.user}
             />
        ))
    )

    displayChannelName= channel => {
        return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
    }

    handleSearchChange= event => {
        this.setState({
            searchTerm: event.target.value,
            loadingSearch: true
        }, () => this.handleSearchMessages());
    }

    handleSearchMessages= () => {
        const channelMessages= [...this.state.messages];
        const regex= new RegExp(this.state.searchTerm, 'gi');
        const searchResults= channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || 
                message.user.name.match(regex)){
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({ searchResults });
        setTimeout( () => this.setState({ loadingSearch: false }), 1000);
    }

    render(){
        const {messagesRef, user, messages, channel,
              numUniqueUsers, searchResults, searchTerm,
              loadingSearch, privateChannel } = this.state;
        return (
            <React.Fragment>
                <MessageHeader
                    channelName= {this.displayChannelName(channel)}
                    numUniqueUsers= {numUniqueUsers}
                    handleSearchChange= {this.handleSearchChange}
                    searchLoading= {loadingSearch}
                    isPrivateChannel= {privateChannel}
                 />

                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messagesRef= {messagesRef}
                    user= {user}
                    channel= {channel}
                    isPrivateChannel= {privateChannel}
                    getMessagesRef= {this.getMessageRef}
                />
            </React.Fragment>
        )
    }
}

export default Messages;