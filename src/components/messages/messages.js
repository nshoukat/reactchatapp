import React from 'react';
import {Segment, Comment} from 'semantic-ui-react';
import MessageHeader from './messageheader'
import MessageForm from './messageform';
import '../../components/App.css';
import firebase from '../../firebase';
import Message from './message';
import {connect} from 'react-redux';
import {setUserPosts} from '../../actions';

class Messages extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            messages: [],
            messagesLoading: true,
            privateChannel: this.props.isPrivateChannel,
            user: this.props.currentUser,
            channel: this.props.currentChannel,
            isChannelStarred: false,
            privateMessagesRef: firebase.database().ref('privateMessages'),
            messagesRef:  firebase.database().ref('messages'),
            userRef: firebase.database().ref('users'),
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
            this.addUserStarsListener(channel.id, user.uid);  
        }
    }

    addListerners= channelId => {
        this.addMessageListeners(channelId);
    }

    addUserStarsListener= (channelId, userId) => {
        this.state.userRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null){
                    const channelIds= Object.keys(data.val());
                    const prevStarred= channelIds.includes(channelId);
                    this.setState({isChannelStarred: prevStarred});
                }
            });
    }

    addMessageListeners= channelId => {
        let loadedMessages= [];
        const ref= this.getMessageRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({messages: loadedMessages, messagesLoading: false});
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
    }

    getMessageRef= () => {
        const {privateChannel, privateMessagesRef, messagesRef}= this.state;
        return privateChannel ? privateMessagesRef : messagesRef;
    }

    countUserPosts= messages => {
        let userPosts= messages.reduce((acc, message) => {
            if(message.user.name in acc){
                acc[message.user.name].count +=1;
            }else{
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
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

    handleStar= () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    };

    starChannel= () =>{
        if(this.state.isChannelStarred){
            this.state.userRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            //avatar: this.state.channel.createdBy.avatar
                        }
                    }
                });
        }else{
            this.state.userRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if(err !== null){
                        console.log(err);
                    }
                });
        }
    };

    render(){
        const {messagesRef, user, messages, channel,
              numUniqueUsers, searchResults, searchTerm,
              loadingSearch, privateChannel, isChannelStarred } = this.state;
        return (
            <React.Fragment>
                <MessageHeader
                    channelName= {this.displayChannelName(channel)}
                    numUniqueUsers= {numUniqueUsers}
                    handleSearchChange= {this.handleSearchChange}
                    searchLoading= {loadingSearch}
                    isPrivateChannel= {privateChannel}
                    handleStar= {this.handleStar}
                    isChannelStarred= {isChannelStarred}
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

export default connect(null, {setUserPosts})(Messages);