import React from 'react';
import {Menu,Icon} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel, setPrivateChannel} from '../../actions';


class Starred extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            starredChannels: [],
            activeChannel: '',
        }
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