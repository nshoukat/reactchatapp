import React from 'react';
import {Menu, Icon, Modal, Form, Input, Button, Label} from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';
import '../../components/App.css';

class Channels extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            activeChannel: '',
            channel: null,
            channels: [],
            channelName: '',
            channelDetails: '',
            modal: false,
            channelRef: firebase.database().ref('channels'),
            messagesRef: firebase.database().ref('messages'),
            notifications: [],
            user: this.props.currentUser,
            firstLoad: true
        }
    }

    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount(){
        this.state.channelRef.off('child_added');
    }

    addListeners = () => {
        let loadedChannels = [];
        this.state.channelRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels} , () => {this.setFirstChannel()});
            this.addNotificationListener(snap.key);
        });
    }

    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on('value', snap => {
            if(this.state.channel){
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap);
            }
        });
    };

    handleNotifications= (channelId, currentChannelId, notifications, snap) => {
        let lastTotal= 0;
        let index= notifications.findIndex(notification => notification.id === channelId);
        if(index !== -1){
            if(channelId !== currentChannelId){
                lastTotal= notifications[index].total;
                if(snap.numChildren() - lastTotal > 0){
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal= snap.numChildren();
        }else{
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }
        this.setState({notifications});
    };

    setFirstChannel = () => {
        const firstChannel= this.state.channels[0];
        if(this.state.firstLoad && this.state.channels.length > 0){
            this.props.setCurrentChannel(firstChannel);
            this.props.setPrivateChannel(false);
            this.setState({ channel: firstChannel});
        }
        this.setState({firstLoad: false, activeChannel: firstChannel.id});
    };

    handleSubmit= event => {
        event.preventDefault();
        if(this.isFormValid(this.state)){
           this.addChannel();
        }
    };

    isFormValid = ({channelName, channelDetails }) => channelName && channelDetails;

    addChannel= () => {
        const {channelRef, channelDetails, channelName, user}= this.state;
        const key = channelRef.push().key;

        const newChannel ={
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avater: user.photoURL
            }
        };

        channelRef
        .child(key)
        .update(newChannel)
        .then(() => {
            this.setState({channelDetails: '', channelName: ''});
            this.closeModal();
            console.log("Channel Added");
        }).catch(err => {
            console.log(err);
        })
    };

    handleChange= event => {
        this.setState({[event.target.name] : event.target.value});
    }

    closeModal= () => {
        this.setState({modal: false});
    };

    openModal= () => {
        this.setState({modal: true});
    };

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({channel});
    };

    clearNotifications= () => {
        let index= this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);
        if(index !== -1){
            let updatedNotifications= [...this.state.notifications];
            updatedNotifications[index].total= this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count= 0;
            this.setState({notifications: updatedNotifications});
        }
    };

    setActiveChannel= channel => {
        this.setState({activeChannel: channel.id});
    };

    getNotificationCount= channel => {
        let count= 0;
        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id){
                count= notification.count;
            }
        });
        if(count > 0)
            return count;
    };

    displayChannels = channels => (
        channels.length > 0 && channels.map(channel =>  (
             <Menu.Item
             key= {channel.id}
             name= {channel.name}
             onClick= {() => this.changeChannel(channel)}
             style= {{opacity: 0.7}}
             active= {channel.id === this.state.activeChannel}
             >
                {this.getNotificationCount(channel) && 
                (<Label color="red">{this.getNotificationCount(channel)}</Label>)}
               # {channel.name}
            </Menu.Item>
        ))
    );

    render(){
        const {channels, modal} = this.state;

        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{" "}
                        ({channels.length})
                        <Icon name="add" onClick={this.openModal}/>
                    </Menu.Item>
                    {/* Channels */}
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.onSubmit}>
                            <Form.Field>
                                <Input 
                                fluid
                                label= "Name of Channel"
                                name= "channelName"
                                onChange={this.handleChange}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input fluid
                                    label= "Channel Details"
                                    name= "channelDetails"
                                    onChange={this.handleChange}
                                    />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" />Add
                        </Button>
                        <Button color="red" inverted>
                            <Icon name="remove" onClick={this.closeModal}/>Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Channels);