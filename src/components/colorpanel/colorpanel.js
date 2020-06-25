import React from 'react';
import {Sidebar, Divider, Button, Menu, Modal, Icon, Label, Segment} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import firebase from '../../firebase';
import '../App.css'
import {connect} from 'react-redux';
import {setColors} from '../../actions';

class ColorPanel extends React.Component{

    constructor(props){
        super(props);
        this.state= {
            modal: false,
            primary: '',
            secondary: '',
            user: this.props.currentUser,
            userRef: firebase.database().ref('users'),
            userColors: []
        }
    }

    componentDidMount(){
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    addListener= userId => {
        let userColors= [];
        this.state.userRef
            .child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val());
                this.setState({userColors});
            })
    }

    displayUserColors= userColors => (
        userColors.length > 0 && userColors.map((userColor, i) => (
            <React.Fragment key={i}>
                <Divider />
                <div 
                    className="color__container"
                    onClick={() => this.props.setColors(userColor.primary, userColor.secondary)}
                >
                    <div 
                        className="color__square"
                        style={{background: userColor.primary}}
                    >
                        <div 
                            className="color__overlay" 
                            style={{background: userColor.secondary}}
                        >
                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    );

    openModal= () => this.setState({modal: true});

    closeModal= () => this.setState({modal: false});

    handleChangePrimary= color => this.setState({primary: color.hex});

    handleChangeSecondary= color => this.setState({secondary: color.hex});

    handleSaveColor= () => {
        const{ primary, secondary}= this.state;
        if(primary && secondary){
            this.saveColors(primary, secondary);
        }
    };

    saveColors= (primary, secondary) => {
        this.state.userRef
            .child(`${this.state.user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(() => {
                console.log('Colors Adeed');
                this.closeModal()
            })
            .catch(err => console.error(err));
    };

    render(){
        const {modal, primary, secondary, userColors} = this.state;
        return (
            <Sidebar
                as= {Menu}
                icon= "labeled"
                inverted
                vertical
                visible
                width= "very thin"
            >

                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />
                {this.displayUserColors(userColors)}
                <Modal basic  open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary Color" />
                            <SliderPicker color={primary} onChange={this.handleChangePrimary} />
                        </Segment>
                        <Segment inverted>
                            <Label content="Secondary Color" />
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                    <Button color="green" inverted onClick={this.handleSaveColor}>
                        <Icon name="checkmark"/> Save Colors
                    </Button>
                    <Button color="red" inverted onClick={this.closeModal}>
                        <Icon name="remove"/> Cancel
                    </Button>
                    </Modal.Actions>
                </Modal>

            </Sidebar>
        )
    }
}

export default connect(null, {setColors})(ColorPanel);