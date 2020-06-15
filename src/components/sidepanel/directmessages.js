import React from 'react';
import {Menu, Icon} from 'semantic-ui-react';
import '../../components/App.css';
import { useStore } from 'react-redux';

class DirectMessages extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            users: []
        }
    }

    render(){
        const {users}= this.state;
        <Menu.Menu className="menu">
            <Menu.Item>
                <span>
                    <Icon name="mail" /> DIRECT MESSAGES
                </span>{' '}
                ({users.length})
            </Menu.Item>
            {/* Users to send direct messages */}
        </Menu.Menu>
    }
}