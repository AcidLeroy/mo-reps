import React, { Component } from 'react';
import { UserSession, Person } from 'blockstack'

import GaiaLevelDOWN from 'gaiadown-ts'
import memdown from 'memdown'

import Navbar from './Navbar';
import 'bulma/css/bulma.css'
import populateDb from './mock-db'
import levelup, { LevelUp } from 'levelup'
import WorkoutModal from './WorkoutModal'
import WorkoutDb from './WorkoutDb'

const R = require('ramda')

const USE_MOCK = false; 

interface Props {
  userSession: UserSession
}

interface State {
  person: Person, 
  workoutMatches: string[]; 
  levelDb: LevelUp, 
  workoutDb: WorkoutDb, 
  workoutToMatch: string, 
  selectedWorkoutName: string | null,
  workoutModalActive: boolean, 
  uniqueWorkouts: string[]
}

class Main extends Component<Props, State> {
  constructor(props: Readonly<Props>) {
    super(props)

    let level =  USE_MOCK ? levelup(memdown()) : levelup(new GaiaLevelDOWN("/workouts/", this.props.userSession))
    this.state = {
      person: new Person(this.props.userSession.loadUserData().profile),
      workoutMatches: [], 
      workoutDb: new WorkoutDb(level),
      levelDb: level, 
      workoutToMatch: "", 
      selectedWorkoutName: null,
      workoutModalActive: false, 
      uniqueWorkouts: []
    }

    this.findMatches = this.findMatches.bind(this)
    this.toggleWorkoutModal = this.toggleWorkoutModal.bind(this)
    this.selectWorkout = this.selectWorkout.bind(this)
  }

  findMatches(event: any){
    let workoutToMatch = event.target.value; 
    this.setState({workoutToMatch: workoutToMatch})
    let matches = R.filter(
      R.startsWith(R.toLower(workoutToMatch)), 
      this.state.uniqueWorkouts
    )

    this.setState({workoutMatches: matches})
  }

  toggleWorkoutModal() {
    this.setState({workoutModalActive: !this.state.workoutModalActive})
    this.state.workoutDb.listUniqueWorkouts().then(w => {
      this.setState({uniqueWorkouts: w})
      this.setState({workoutMatches: w})
    })
  }

  selectWorkout(event: any) {
    this.setState({selectedWorkoutName: event.currentTarget.value})
    this.toggleWorkoutModal()
    
  }

  componentDidMount(){
    if(USE_MOCK) {
     populateDb(this.state.levelDb)
    } 
    this.state.workoutDb.listUniqueWorkouts().then(w => {
      this.setState({uniqueWorkouts: w})
      this.setState({workoutMatches: w})
    })
  }

  render() {
    return (
      <div>
        <Navbar userSession={this.props.userSession} />
        <section className="section">

          <div className="container"> 
          <WorkoutModal userSession={this.props.userSession} workoutName={this.state.selectedWorkoutName} 
                isActive={this.state.workoutModalActive} toggleActive={this.toggleWorkoutModal} 
                workoutDb={this.state.workoutDb}/>

          </div>

          <div className="container has-text-centered">
            <span className="is-size-3 has-text-primary"><b>Welcome {this.state.person.name()}!</b></span> 
          </div>

          <div className="container has-text-centered">
            <div className="tile is-ancestor"> 
              <div className="tile is-parent is-vertical">
                <div className="tile is-child is primary box has-background-light"> 
                  <p className="title"> Enter a workout </p> 
                 
                  <input className="input box" type="text" value={this.state.workoutToMatch} onChange={this.findMatches} placeholder="Workout name, e.g. Squat"></input>
                  {this.state.workoutMatches.map(x => {
                    return (
                      <div key={x} className="container box is-paddingless">
                        <button className="button is-fullwidth is-primary" key={x} value={x} onClick={this.selectWorkout}> {x} </button>
                    </div>
                    ) 
                  })} 
        
                  {
                    (this.state.uniqueWorkouts.length === 0 || (this.state.workoutToMatch !== "" && (typeof (R.find(R.propEq('name', this.state.workoutToMatch))(this.state.workoutDb))==='undefined') ))? (
                      <button className="button is-fullwidth is-primary" value={this.state.workoutToMatch} onClick={this.selectWorkout} >
                        <span className="icon">
                          <i className="fas fa-plus-circle"></i>
                        </span>
                         <span>Add New Workout</span>
                      </button>
                    ) : (
                      null
                    )
                  }
                </div>  
              </div>
            </div>
          </div>
        </section>

      </div>
    )
  }
}

export default Main;