import React, { Component } from 'react';
import 'bulma/css/bulma.css'
import WorkoutDocument from './WorkoutDocument';
import SetWeightGroup from './components/SetWeightGroup'
import './WorkoutModal.css'
import EditableMuscleGroup from './components/EditableMuscleGroup'
import WorkoutStatsDropDown from './components/WorkoutStatsDropDown'
import { generateWorkoutKey } from './WorkoutDb'
const R = require('ramda')

interface Props {
    workouts: { key: string | null, value: WorkoutDocument }[],
    isActive: boolean,
    workoutName: string,
    toggleActive: () => void,
    deleteAll: () => void,
    saveWorkout: (workout: { key: string | null, value: WorkoutDocument }) => void,
    updateMuscleGroup: (workoutName: string, newMuscleGroup: string) => void
}


interface State {
    sets: { key: string | null, value: WorkoutDocument }[],
    muscleGroup: string

}

class WorkoutModal extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            sets: [{
                key: null,
                value: {}
            }],
            muscleGroup: "unknown"
        }
        this.saveWorkout = this.saveWorkout.bind(this);
        this.refreshWorkout = this.refreshWorkout.bind(this);
        this.getMuscleGroup = this.getMuscleGroup.bind(this);
        this.getWorkoutsByType = this.getWorkoutsByType.bind(this);
    }

    getMuscleGroup(): string {
        let workout = R.find((x: { key: string | null, value: WorkoutDocument }) => x.value.name === this.props.workoutName)(this.props.workouts)
        if (workout && workout.value && workout.value.muscleGroup) return workout.value.muscleGroup
        else return this.state.muscleGroup;
    }

    getWorkoutsByType() {
        let matching = R.filter((x: { key: string | null, value: WorkoutDocument }) => { return x.value.name === this.props.workoutName }, this.props.workouts)
        let a = R.map(R.prop('value'), matching)
        return a
    }


    async saveWorkout(id: number, weight: number, reps: number) {
        let sets = this.state.sets;

        let set = sets[id];
        set.value.reps = reps;
        set.value.weight = weight;
        set.value.date = Date.now();
        set.value.muscleGroup = this.getMuscleGroup();
        const name = this.props.workoutName.trim();

        set.key = (set.key === null) ? generateWorkoutKey(name) : set.key;
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
        this.setState({ muscleGroup: "unknown" })
        if (this.props.workoutName) {
            if (this.getWorkoutsByType() > 0) {
                this.setState({
                    sets: [{
                        key: null, value: {
                            muscleGroup: this.getMuscleGroup(),
                            set: 1,
                            units: "lbs",
                            name: this.props.workoutName || "unknown"
                        }
                    }],

                })

            } else {
                this.setState({
                    sets: [{
                        key: null, value: {
                            muscleGroup: this.getMuscleGroup(),
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

                            <div className="columns is-multiline">
                                <div className="column is-full">
                                    <h1 className="title has-text-centered workout-title">
                                        {this.props.workoutName ? this.props.workoutName : "No workout chosen"}
                                        <button className="button deleter" onClick={this.props.deleteAll}>
                                            <span className="icon is-large has-text-danger">
                                                <i className="fas fa-times"></i>
                                            </span>

                                        </button>
                                    </h1>
                                </div>
                                <div className="column is-full">
                                    <EditableMuscleGroup muscleGroup={this.getMuscleGroup()}
                                        updateGroup={(newName: string) => {
                                            this.setState({ muscleGroup: newName })
                                            return this.props.updateMuscleGroup(this.props.workoutName, newName)
                                        }
                                        } />
                                </div>
                                <div className="column is-full">
                                    <WorkoutStatsDropDown workouts={this.getWorkoutsByType()} />
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