import React from 'react';
import {Menu} from 'semantic-ui-react';
import UserPanel from './userpanel';
import Channels from './channels';
import DirectMessages from './directmessages';
import Starred from './starred';

class SidePanel extends React.Component{

    constructor(props){
        super(props);
    }
    
    render(){
        const {currentUser} = this.props;

        return (
            <Menu
                size= "large"
                inverted
                fixed= "left"
                vertical
                style= {{background: '#4c3c4c', fontSize: '1.2rem'}}
            >
                <UserPanel currentUser= {currentUser} />
                <Starred />
                <Channels currentUser={currentUser} />
                <DirectMessages currentUser= {currentUser} />
            </Menu>
        )
    }
}

export default SidePanel;