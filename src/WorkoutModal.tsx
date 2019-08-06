import React, { Component } from 'react';
import 'bulma/css/bulma.css'
import WorkoutDocument from './WorkoutDocument';
import SetWeightGroup from './components/SetWeightGroup'
import './WorkoutModal.css'
import EditableMuscleGroup from './components/EditableMuscleGroup'
import WorkoutStatsDropDown from './components/WorkoutStatsDropDown'
import {generateWorkoutKey} from './WorkoutDb'
const R = require('ramda')

interface Props {
    workouts: {key: string | null, value: WorkoutDocument}[], 
    isActive: boolean,
    workoutName: string, 
    toggleActive: () => void, 
    deleteAll: () => void, 
    saveWorkout: (workout: {key: string | null, value: WorkoutDocument}) => void, 
    updateMuscleGroup: (workoutName: string, newMuscleGroup : string) =>void
}


interface State {
    sets: { key: string | null, value: WorkoutDocument }[],
}

class WorkoutModal extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            sets: [{
                key: null,
                value: {}
            }],
        }
        this.saveWorkout = this.saveWorkout.bind(this);
        this.refreshWorkout = this.refreshWorkout.bind(this);
        this.getMuscleGroup = this.getMuscleGroup.bind(this); 
        this.getWorkoutsByType = this.getWorkoutsByType.bind(this); 
    }

    getMuscleGroup() : string {
        let workout = R.find((x: {key: string | null, value: WorkoutDocument}) => x.value.name===this.props.workoutName)(this.props.workouts)
        if(workout && workout.value && workout.value.muscleGroup) return workout.value.muscleGroup 
        else return "unknown"
    }

    getWorkoutsByType() {
        console.log('workout name', this.props.workoutName)
        let matching =  R.filter((x: {key: string | null, value: WorkoutDocument}) =>{ return x.value.name === this.props.workoutName}, this.props.workouts)
        let a =  R.map(R.prop('value'), matching)
        console.log('workout modal getWorkoutsByType = ', a)
        return a
    }


    async saveWorkout(id: number, weight: number, reps: number) {
        let sets = this.state.sets;

        let set = sets[id];
        set.value.reps = reps;
        set.value.weight = weight;
        set.value.date = Date.now(); 

        set.key = (set.key === null) ? generateWorkoutKey(this.props.workoutName) : set.key;
        this.props.saveWorkout(set); 

        this.setState({ sets: sets })

        if (sets[sets.length - 1].key !== null) {
            sets.push({
                key: null,
                value: {
                    muscleGroup: this.getMuscleGroup(),
                    set: sets.length,
                    units: "lbs",
                    name: this.props.workoutName || "unknown"
                }
            })
            this.setState({ sets: sets })
        }
    }



    refreshWorkout() {
        console.log('modal workout name = ', this.props.workoutName)
        if (this.props.workoutName) {
            if (this.getWorkoutsByType() > 0) {
                this.setState({
                    sets: [{
                        key: null, value: {
                            muscleGroup: this.getMuscleGroup() || "unknown",
                            set: 1,
                            units: "lbs",
                            name: this.props.workoutName || "unknown"
                        }
                    }]
                })

            } else {
                this.setState({
                    sets: [{
                        key: null, value: {
                            muscleGroup: "unknown",
                            set: 1,
                            units: "lbs",
                            name: this.props.workoutName || "unknown"
                        }
                    }]
                })
            }

        }
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        if (prevProps.workoutName !== this.props.workoutName) {
            this.refreshWorkout();
        }
    }

    render() {
        return (
            <div className={"modal section" + (this.props.isActive ? " is-active" : "")}>
                <div className="modal-background"></div>
                <div className="modal-content">
                    <div className="container">
                        <div className="box">
                         
                                <div className="columns">
                                    <div className="column">
                                        <h1 className="title has-text-centered workout-title">
                                            {this.props.workoutName ? this.props.workoutName : "No workout chosen"}
                                            <button className="button deleter" onClick={this.props.deleteAll}>
                                                <span className="icon is-medium has-text-danger">
                                                    <i className="fas fa-times"></i>
                                                </span>
                                    
                                            </button>
                                        </h1>

                                        <div className="column">
                                            <EditableMuscleGroup muscleGroup={this.getMuscleGroup()} 
                                            updateGroup={(newName: string) => this.props.updateMuscleGroup(this.props.workoutName, newName)} />
                                        </div>

                                        <div className="columns ">
                                            <WorkoutStatsDropDown workouts={this.getWorkoutsByType()} />
                                        </div>

                                    </div>
                                </div>

                                {this.state.sets.map((v, idx) => {
                                    let i = this.state.sets.length - idx - 1;
                                    return <SetWeightGroup key={i} id={i} saveWorkout={this.saveWorkout} 
                                        name={this.props.workoutName || "unknown"} />
                                })}

                         
                        </div>

                    </div>
                </div>
                <button className="modal-close is-large" onClick={this.props.toggleActive} aria-label="close"></button>
            </div>
        )
    }
}

export default WorkoutModal;