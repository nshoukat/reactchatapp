import React from 'react';
import {Segment, Button, Input} from 'semantic-ui-react';
import '../../components/App.css';
import firebase from '../../firebase';
import FileModal from './filemodal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './progressbar';

class MessageForm extends React.Component{
    constructor(props){
        super(props);
        this.state= {
            percentUploaded: 0,
            storageRef: firebase.storage().ref(),
            uploadTask: null,
            uploadState: '',
            message: '',
            channel: this.props.channel,
            user: this.props.user,
            messagesRef: this.props.messagesRef,
            loading: false,
            errors: [],
            modal: false
        }
    }

    handleChange = event => {
        this.setState({[event.target.name] : event.target.value});
    }

    createMessage = (fileUrl = null) => {
        const {user} = this.state;
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: user.uid,
                name: user.displayName,
                avatar: user.photoURL
            }
        };
        if(fileUrl !== null){
            message['image']= fileUrl
        }else{
            message['content']= this.state.message
        }
        return message;
    }

    sendMessage = () => {
        const {messagesRef, channel, message} = this.state;
        if(message){
            this.setState({loading: true});
            messagesRef
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(() => {
                this.setState({loading: false, message: '', errors: []});
            })
            .catch(err => {
                console.log(err);
                this.setState({loading: false, errors: this.state.errors.concat(err)})
            })
        } else{
            this.setState({errors: this.state.errors.concat({message: 'Add a message'})});
        }
    }

    openModel= () => this.setState({modal: true});

    closeModal= () => this.setState({modal: false});

    uploadFile= (file, metadata) => {
        const pathToUpload= this.state.channel.id;
        const ref= this.state.messagesRef;
        const filePath= `chat/public/${uuidv4()}.jpg`;
        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
        () => {
            this.state.uploadTask.on('state_changed', snap => {
                const percentUploaded= Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                this.setState({percentUploaded});
            },
            err => {
                console.error(err);
                this.setState({
                    uploadState: 'error',
                    uploadTask: null,
                    errors: this.state.errors.concat(err)
                });
            },
            () => {
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                        this.sendFileMessage(downloadUrl, ref, pathToUpload);

                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: 'error',
                        uploadTask: null
                    })
                })
            })
        });
    };

    sendFileMessage= (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({uploadState: 'done'})
            })
            .catch( err => {
                this.setState({errors: this.state.errors.concat(err)});
            })
    }

    render(){
        const {errors, message, loading, modal, percentUploaded, uploadState} = this.state;
        return (
            <Segment>
                <Input
                    fluid
                    name="message"
                    style={{marginBottom: '0.7em'}}
                    label={<Button icon={'add'} />}
                    labelPosition="left"
                    placeholder="Write your message"
                    onChange={this.handleChange}
                    value= {message}
                    className= {
                        errors.some(error => error.message.includes('message')) ? 'error' : ''
                    }
                />

                <Button.Group icon widths="2">
                    <Button 
                        onClick= {this.sendMessage}
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        disabled= {loading}
                        icon="edit"
                    />

                    <Button 
                        color="teal"
                        onClick= {this.openModel}
                        disabled= {uploadState === "uploading"}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />

                    <FileModal
                        modal={modal}
                        closeModal={this.closeModal}
                        uploadFile={this.uploadFile}
                    />

                </Button.Group>

                <ProgressBar 
                    percentUploaded= {percentUploaded}
                    uploadState= {uploadState}
                />

            </Segment>
        )
    }
}

export default MessageForm;