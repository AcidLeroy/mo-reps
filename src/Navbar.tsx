import React, { Component } from 'react';
import { UserSession, Person } from 'blockstack'
import 'bulma/css/bulma.css'
import './Navbar.css'
interface Props {
  userSession: UserSession
}

interface State {
  person: Person,
  hamburgerActive: boolean
}


class Navbar extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props)
    this.state = {
      person: new Person(this.props.userSession.loadUserData().profile),
      hamburgerActive: false
    }

    this.handleSignOut = this.handleSignOut.bind(this)
    this.hamburgerClicked = this.hamburgerClicked.bind(this)

  }

  hamburgerClicked(event: { preventDefault: () => void; }) {
    console.log("HamburgerClicked! ")
    console.log('state = ', this.state)
    this.setState({ hamburgerActive: !this.state.hamburgerActive })
  }

  handleSignOut(event: { preventDefault: () => void; }) {
    event.preventDefault();
    this.props.userSession.signUserOut(window.location.href)
  }

  render() {
    return (
      <div>
        <nav className="navbar " role="navigation" aria-label="main navigation">
          <div className="navbar-brand">
            <a className="navbar-item" href="https://bulma.io">
            <i className="icon has-text-white is-medium fas fa-dumbbell"></i>
              <span className=" has-text-white is-size-2">Mo-Reps!</span>
            </a>

            <a role="button" href="/#" className={"navbar-burger burger " + (this.state.hamburgerActive? "is-active" : "")} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={this.hamburgerClicked}>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>

          <div id="navbarBasicExample" className={"navbar-menu " + (this.state.hamburgerActive? "is-active" : "")}>
            <div className="navbar-start ">
              <a href="/#" className={"navbar-item has-text-"+ (this.state.hamburgerActive? "black" : "white")}>
                Home
              </a>

              <a href="/#" className={"navbar-item has-text-"+ (this.state.hamburgerActive? "black" : "white")}>
                Workout Stats
              </a>

            </div>

            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  <a href="/#" className="button is-primary" onClick={this.handleSignOut}>
                    <strong>Sign-out</strong>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

export default Navbar;