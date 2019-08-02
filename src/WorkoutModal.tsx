import React, { Component } from 'react';
import { UserSession } from 'blockstack'
import 'bulma/css/bulma.css'
import WorkoutDocument from './WorkoutDocument';
import WorkoutDb from './WorkoutDb';
import SetWeightGroup from './components/SetWeightGroup'
import './WorkoutModal.css'
import EditableMuscleGroup from './components/EditableMuscleGroup'
import WorkoutStatsDropDown from './components/WorkoutStatsDropDown'
import * as R from 'ramda'

interface Props {
    userSession: UserSession,
    workoutName: string | null,
    isActive: boolean,
    workoutDb: WorkoutDb
    toggleActive: () => void
}


interface State {
    muscleGroup: string,
    sets: { key: string | null, value: WorkoutDocument }[],
    workouts: WorkoutDocument[]
}

class WorkoutModal extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            muscleGroup: "Some group",
            sets: [{
                key: null,
                value: {}
            }],
            workouts: []
        }
        this.saveWorkout = this.saveWorkout.bind(this);
        this.updateMuscleGroup = this.updateMuscleGroup.bind(this);
        this.refreshWorkout = this.refreshWorkout.bind(this);
        this.updateStats = this.updateStats.bind(this);
        this.deleteAll = this.deleteAll.bind(this); 
    }


    async saveWorkout(id: number, weight: number, reps: number) {
        let sets = this.state.sets;

        let set = sets[id];
        set.value.reps = reps;
        set.value.weight = weight;
        let key = await this.props.workoutDb.saveWorkout(null, set.value)
        set.key = key;
        this.setState({ sets: sets })

        if (sets[sets.length - 1].key != null) {
            sets.push({
                key: null,
                value: {
                    muscleGroup: this.state.muscleGroup,
                    set: sets.length,
                    units: "lbs",
                    name: this.props.workoutName || "unkown"
                }
            })
            this.setState({ sets: sets })
        }
        this.updateStats()
    }

    updateMuscleGroup(newMuscleGroup: string) {
        this.setState({ muscleGroup: newMuscleGroup })
        this.props.workoutDb.renameMuscleGroup(this.props.workoutName || "unkown", newMuscleGroup)
            .then(this.refreshWorkout)
    }

    updateStats() {
        if (this.props.workoutName) {
            this.props.workoutDb.getWorkoutsByName(this.props.workoutName).then(x => {
                this.setState({ workouts: R.map(R.prop('value'), x) })
            })
        }
    }

    deleteAll() {
        if (this.props.workoutName){
            this.props.workoutDb.deleteWorkout(this.props.workoutName).then(() => {
                console.log('Successfully deleted workout: ', this.props.workoutName)
                this.props.toggleActive(); 
            })
        }
    }

    refreshWorkout() {
        if (this.props.workoutName) {
            this.props.workoutDb.getWorkoutsByName(this.props.workoutName).then(x => {
                if (x.length > 0) {
                    this.setState({
                        sets: [{
                            key: null, value: {
                                muscleGroup: x[0].value.muscleGroup || "unknown",
                                set: 1,
                                units: "lbs",
                                name: this.props.workoutName || "unkown"
                            }
                        }]
                    })
                    this.setState({ muscleGroup: x[0].value.muscleGroup || "unknown" })
                    this.updateStats();
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
                    this.setState({ muscleGroup: "unknown" })
                }
            })
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
                            <div className="container ">

                                <div className="columns">
                                    <div className="column">
                                        <h1 className="title has-text-centered workout-title">
                                            {this.props.workoutName ? this.props.workoutName : "No workout chosen"}
                                            <button className="button deleter" onClick={this.deleteAll}>
                                                <span className="icon is-medium has-text-danger">
                                                    <i className="fas fa-times"></i>
                                                </span>
                                    
                                            </button>
                                        </h1>

                                        <div className="column">
                                            <EditableMuscleGroup muscleGroup={this.state.muscleGroup} updateGroup={this.updateMuscleGroup} />
                                        </div>

                                        <div className="columns ">
                                            <WorkoutStatsDropDown workouts={this.state.workouts} />
                                        </div>


                                    </div>
                                </div>

                                {this.state.sets.map((v, idx) => {
                                    let i = this.state.sets.length - idx - 1;
                                    return <SetWeightGroup key={i} id={i} saveWorkout={this.saveWorkout} name={this.props.workoutName || "unknown"} />
                                })}

                            </div>
                        </div>

                    </div>
                </div>
                <button className="modal-close is-large" onClick={this.props.toggleActive} aria-label="close"></button>
            </div>
        )
    }
}

export default WorkoutModal;