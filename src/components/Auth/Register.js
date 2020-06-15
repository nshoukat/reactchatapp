import React, { Component } from 'react';
import '../App.css';
import firebase from '../../firebase';
import { Grid, Button, Header, Message, Form, Icon, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import md5 from 'md5';

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      errors: [],
      loading: false,
      usersRef: firebase.database().ref('users')
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputError = this.handleInputError.bind(this);
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({loading : true, errors: []});
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          createdUser.user.updateProfile({
            displayName : this.state.userName,
            photoURL : `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
          .then(() => {
            this.saveUser(createdUser).then(() => {
              this.setState({loading: false});
            })
          }).catch(err => {
            this.setState({loading : false, errors : this.state.errors.concat(err)});
          })
        })
        .catch(err => {
          this.setState({loading : false, errors : this.state.errors.concat(err)});
        })
    }
  };

  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      error = { message: "Please fill all fields" }
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" }
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ userName, email, password, passwordConfirmation }) => {
    return !userName.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleInputError = (errors, inputType) => {
    return errors.some(error => error.message.toLowerCase().includes(inputType)) ? "error" : '';
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  }

  render() {
    const { userName, email, password, passwordConfirmation, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input fluid name="userName" value={userName} icon="user" iconPosition="left" placeholder="User Name"
                onChange={this.handleChange} type="text" />

              <Form.Input fluid name="email" value={email} icon="mail" iconPosition="left" placeholder="Email Address"
                onChange={this.handleChange} className={this.handleInputError(errors, 'email')} 
                type="email" />

              <Form.Input fluid name="password" value={password} icon="lock" iconPosition="left" placeholder="Password"
                onChange={this.handleChange} className={this.handleInputError(errors, 'password')} type="password" />

              <Form.Input fluid name="passwordConfirmation" value={passwordConfirmation} icon="repeat" iconPosition="left" 
              placeholder="Password Confirmation" onChange={this.handleChange} className={this.handleInputError(errors, 'password')} 
              type="password" />

              <Button className= {loading ? 'loading' : ''} disabled={loading} color="orange" size="large" fluid>Register</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
