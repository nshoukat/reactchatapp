import React, { Component } from 'react';
import '../App.css';
import firebase from '../../firebase';
import { Grid, Button, Header, Message, Form, Icon, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: [],
      loading: false
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
    if (this.isFormValid(this.state)) {
      this.setState({loading: true});
      firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password).then((user => {
        this.setState({loading: false})
      })).catch((err => {
        this.setState({errors: this.state.errors.concat(err), loading: false});
      }))
    }
  };

  isFormValid = ({email, password}) => {
    let errors = [];
    let error;
    if (email && password) {
      return true;
    } else {
      error = { message: "Please fill all fields" }
      this.setState({ errors: errors.concat(error) });
      return false;
    }
  };

  displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleInputError = (errors, inputType) => {
    return errors.some(error => error.message.toLowerCase().includes(inputType)) ? "error" : '';
  };

  render() {
    const {email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>

              <Form.Input fluid name="email" value={email} icon="mail" iconPosition="left" placeholder="Email Address"
                onChange={this.handleChange} className={this.handleInputError(errors, 'email')} 
                type="email" />

              <Form.Input fluid name="password" value={password} icon="lock" iconPosition="left" placeholder="Password"
                onChange={this.handleChange} className={this.handleInputError(errors, 'password')} type="password" />

              <Button className= {loading ? 'loading' : ''} disabled={loading} color="violet" size="large" fluid>Login</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
