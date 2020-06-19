import React from 'react';
import firebase from '../../firebase';
import {Menu,Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../actions';


class Starred extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            user: this.props.currentUser,
            userRef: firebase.database().ref('users'),
            starredChannels: [],
            activeChannel: '',
        }
    }

    componentDidMount(){
        if(this.state.user){
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners= userId => {
        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel= { id: snap.key, ...snap.val() };
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel]
                });
            });

        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove= { id: snap.key, ...snap.val() };
                const filteredChannels= this.state.starredChannels.filter(channel => {
                    return channel.id !== channelToRemove.id;
                });
                this.setState({starredChannels: filteredChannels});
            });
    }

    setActiveChannel= channel => {
        this.setState({activeChannel: channel.id});
    };

    changeChannel = channel => {
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    };

    displayStarredChannels = starredChannels => (
        starredChannels.length > 0 && starredChannels.map(channel =>  (
             <Menu.Item
             key= {channel.id}
             name= {channel.name}
             onClick= {() => this.changeChannel(channel)}
             style= {{opacity: 0.7}}
             active= {channel.id === this.state.activeChannel}
             >
               # {channel.name}
            </Menu.Item>
        ))
    );

    render(){
        const {starredChannels}= this.state;
        return(
            <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="star" /> STARRED
                        </span>{" "}
                        ({starredChannels.length})
                    </Menu.Item>
                    {/* Starred Channels */}
                    {this.displayStarredChannels(starredChannels)}
                </Menu.Menu>
        );
    }
}

export default connect(null, {setCurrentChannel,setPrivateChannel})(Starred);