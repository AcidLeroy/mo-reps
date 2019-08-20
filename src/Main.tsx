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
import WorkoutDocument from './WorkoutDocument';

const Fuse = require('fuse.js'); 

const R = require('ramda')

const re = /(.*)(-.+){5}/

const USE_MOCK = false;

interface Props {
  userSession: UserSession
}

interface State {
  person: Person,
  levelDb: LevelUp,
  workoutDb: WorkoutDb,
  workoutToMatch: string,
  selectedWorkoutName: string | null,
  workoutModalActive: boolean,
  uniqueWorkouts: string[],
  workouts: { key: string | null, value: WorkoutDocument }[],
  loading: boolean,
}

class Main extends Component<Props, State> {

  options: any; 
  constructor(props: Readonly<Props>) {
    super(props)

    let level = USE_MOCK ? levelup(memdown()) : levelup(new GaiaLevelDOWN("/workouts/", this.props.userSession))
    this.state = {
      person: new Person(this.props.userSession.loadUserData().profile),
      workoutDb: new WorkoutDb(level),
      levelDb: level,
      workoutToMatch: "",
      selectedWorkoutName: null,
      workoutModalActive: false,
      uniqueWorkouts: [],
      workouts: [],
      loading: false,
    }

    this.updateWordToMatch = this.updateWordToMatch.bind(this);
    this.toggleWorkoutModal = this.toggleWorkoutModal.bind(this);
    this.selectWorkout = this.selectWorkout.bind(this);
    this.deleteWorkoutByName = this.deleteWorkoutByName.bind(this);
    this.saveWorkout = this.saveWorkout.bind(this); 
    this.updateMuscleGroup = this.updateMuscleGroup.bind(this); 
     this.options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
 
    };
    
  }

  updateMuscleGroup(workoutName: string, newMuscleGroup: string) {
    let workouts = this.state.workouts.map(w =>{
      if (w.key === null) return w
      else {
        let m = w.key.match(re)
        if (m && m[1]){
          if (m[1] === workoutName){
            w.value.muscleGroup = newMuscleGroup; 
          }
        }
        return w; 
      }
    })
    this.setState({workouts: workouts})
    this.setState({loading: true})
    this.state.workoutDb.renameMuscleGroup(workoutName, newMuscleGroup).then(x => {
      console.log('finished updating the muscle group for ', workoutName)
      this.setState({loading: false})
    })
  }

  deleteWorkoutByName(name: string | null) {
    if (name === null) return 
    this.setState({ loading: true })
    this.state.workoutDb.deleteWorkout(name).then(() => {
      console.log('Successfully deleted workout: ', name)
      this.setState({ loading: false })
    })
    let matchFunc = R.curry((nameToDelete: string, entry: { key: string, value: WorkoutDocument }) => {
      let m = entry.key.match(re);
      if (m) {
        if (m[1]) {
          return (m[1] === nameToDelete)
        }
      }
      return false;
    })
    let newWorkouts = R.reject(matchFunc(name), this.state.workouts)
    console.log('Workouts = ', newWorkouts)
    this.setState({ workouts: newWorkouts })
    this.toggleWorkoutModal()
  }

  saveWorkout(workout: {key: string |null , value: WorkoutDocument}){
    if (workout.key === null) return  
    let db = this.state.workoutDb
    let workouts = this.state.workouts
    let found = R.find(R.propEq('key', workout.key))(workouts)
    if (found) {
      found.value = workout.value
    } else {
      workouts.push(workout)
    }
    this.setState({workouts: this.state.workouts})
    this.setState({loading: true})
    db.saveWorkout(workout.key, workout.value).then(() => {
      this.setState({loading: false})
    }).catch(e => {
      this.setState({loading: false})
    }) 
  }

  updateWordToMatch(event: any) {
    let workoutToMatch = event.target.value;
    this.setState({ workoutToMatch: workoutToMatch})
  }

  toggleWorkoutModal() {
    this.setState({ workoutModalActive: !this.state.workoutModalActive })
    let vals = R.map(R.prop('value'), this.state.workouts)
    let unique = R.uniq(R.map(R.prop('name'), vals))
    this.setState({uniqueWorkouts: unique})
  }

  selectWorkout(event: any) {
    this.setState({ selectedWorkoutName: event.currentTarget.value })
    this.toggleWorkoutModal()

  }

  getMatches() : any[] {

    if (this.state.workoutToMatch.trim() === "") return this.state.uniqueWorkouts; 

    var fuse = new Fuse(this.state.uniqueWorkouts, this.options); 
    let a = fuse.search(this.state.workoutToMatch.trim())
    return R.map((x: number) => this.state.uniqueWorkouts[x].trim(), a)  
  
  }

  isWorkoutInDb() : boolean {
    for (let i= 0; i < this.state.workouts.length; i++) {
      if (this.state.workouts[i].value.name!.trim() === this.state.workoutToMatch.trim()){
        return true; 
      }
    }
    return false
  }

  componentDidMount() {
    if (USE_MOCK) {
      populateDb(this.state.levelDb)
    }
    this.setState({ loading: true });
    this.state.workoutDb.fetchAll().then(docs => {
      this.setState({ workouts: docs })
      let vals = R.map(R.prop('value'), docs)
      let unique = R.uniq(R.map(R.prop('name'), vals))
      this.setState({ uniqueWorkouts: unique })
      this.setState({ loading: false })
    })

  }

  render() {
    return (
      <div>
        <Navbar userSession={this.props.userSession} />
        <section className="section">

          <div className="container">
            <WorkoutModal 
                workoutName={this.state.selectedWorkoutName || "unknown"} 
                isActive={this.state.workoutModalActive} 
                toggleActive={this.toggleWorkoutModal} 
                workouts={this.state.workouts}
                deleteAll={() => {this.deleteWorkoutByName(this.state.selectedWorkoutName)}}
                saveWorkout={this.saveWorkout}
                updateMuscleGroup={this.updateMuscleGroup}
                />

          </div>

          <div className="container has-text-centered">
            <span className="is-size-3"><b>{this.state.person.name()}</b></span>
          </div>

          <div className="columns has-text-centered is-multiline">
            <div className="column is-full">
                  <p className="title"> Enter a workout </p>
              </div>
              <div className="column is-full">
                  
                  {this.state.loading? (
                   <div>
                    <p >Syncing with Gaia...</p>
                    <progress className="progress is-large is-primary" max="100">15%</progress>
                   
                    </div>
                  ) : null}
                  </div>
                  <div className="column is-full">
                  <div className="field">
                    <div className="control">
                    <input className="input" type="text" value={this.state.workoutToMatch} onChange={this.updateWordToMatch} placeholder="Workout name, e.g. Squat"></input>
                    </div>
                    </div>
                  {this.getMatches().map(x => {
                    return (
                      <div className="field">
                      <div className="control">
                        <button className="button is-fullwidth is-primary" key={x} value={x} onClick={this.selectWorkout}> {x} </button>
                     </div>
                     </div>
                    )
                  })}

                  {
                    (this.state.uniqueWorkouts.length === 0 || (this.state.workoutToMatch.trim() !== "" && !this.isWorkoutInDb())) ? (
                     <div className="field">
                     <div className="control">
                      <button className="button is-fullwidth is-primary" value={this.state.workoutToMatch.trim()} onClick={this.selectWorkout}>
                        <span className="icon">
                          <i className="fas fa-plus-circle"></i>
                        </span>
                        <span>Add New Workout</span>
                      </button>
                      </div>
                      </div>
                    ) : (
                        null
                      )
                  }
              </div>
            </div>
        </section>

      </div>
    )
  }
}

export default Main;