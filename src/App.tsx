import React, { Component } from 'react';
import blockstack from 'blockstack';
import Main from './Main';
import 'bulma/css/bulma.css'
import './App.css'
import Level2Content from './level2-content';

interface State {
  userSession: blockstack.UserSession,
  person: any
}


class App extends Component<{}, State>  {

  constructor(props: any) {
    super(props)

    this.state = {
      userSession: new blockstack.UserSession(),
      person: null
    }

    this.checkSignedInStatus();

    if (this.state.userSession.isUserSignedIn()) {
      this.loadPerson();
    } else {
      console.log('user is not signed in.')
    }

    this.handleSignIn = this.handleSignIn.bind(this)
  }

  checkSignedInStatus() {
    if (this.state.userSession.isUserSignedIn()) {
      return true;
    } else if (this.state.userSession.isSignInPending()) {
      this.state.userSession.handlePendingSignIn().then(function (userData) {
        window.location.href = window.location.origin
      })
      return false;
    }
  }

  loadPerson() {
    let username = this.state.userSession.loadUserData().username

    blockstack.lookupProfile(username).then((person) => {
      this.setState({ person })
    })
  }

  handleSignIn(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.state.userSession.redirectToSignIn()
  }


  render() {
    return (
      <div className="App">
        {
          this.state.userSession.isUserSignedIn() ? (
            <Main userSession={this.state.userSession} />

          ) : (
              <div>
                <section className="hero is-primary">
                  <div className="hero-body">

                    <div className="columns">
                      <div className="column is-12">
                        <div className="container content">

                          <i className="icon is-large fas fa-dumbbell"></i>
                          <h1 className="title">Get Mo-Reps! <span role="img" aria-label="Bicep">💪</span></h1>
                          <h3 className="subtitle">
                            Securely and privately data-drive your workouts. Designed specifically not to be evil! <span role="img" aria-label="rainbow">🌈</span>
                          </h3>
                          <button onClick={this.handleSignIn} className="button is-primary is-large">
                            <span className="icon">
                              <i className="fas fa-lock"></i>
                            </span>
                            <span>Sign-in with Blockstack</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>
                <Level2Content/>
                <footer className="footer">
                  <div className="content has-text-centered">
                    <p>
                      <strong>Mo-Reps</strong> by <a href="https://codyeilar.com">Cody Eilar</a>. The source code is licensed
                       <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
                      is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY NC SA 4.0</a>.
                    </p>
                  </div>
                </footer>

              </div>

            )
        }
      </div>
    )
  }
}

export default App;
