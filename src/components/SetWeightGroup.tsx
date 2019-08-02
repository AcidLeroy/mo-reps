import React, { Component } from 'react';
import 'bulma/css/bulma.css'


interface Props {
    id: number,
    name: string, 
    saveWorkout: (setNumber: number, weight: number, reps: number) => void
}

interface State {
    weight: number,
    reps: number,
}

class SetWeightGroup extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            weight: 0,
            reps: 0,

        }
        this.updateReps = this.updateReps.bind(this);
        this.updateWeight = this.updateWeight.bind(this);
        this.saveWorkout = this.saveWorkout.bind(this);
        this.weightOnFocus = this.weightOnFocus.bind(this); 
        this.repsOnFocus = this.repsOnFocus.bind(this); 
    }

    weightOnFocus(event: any) {
        event.target.select(); 
    }

    repsOnFocus(event: any) {
        event.target.select(); 
    }

    updateReps(event: any) {
        this.setState({ reps: event.currentTarget.value })
    }

    updateWeight(event: any) {
        this.setState({ weight: event.currentTarget.value })
    }

    saveWorkout(event: any) {
        this.props.saveWorkout(this.props.id, this.state.weight, this.state.reps)
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        if (prevProps.name !== this.props.name){
            this.setState({reps: 0, weight: 0})
        }
    }

    render() {
        return (
            <div className="box is-paddingless">
            <div className="columns box has-background-grey-lighter is-vcentered">
                <div className="column has-text-centered is-paddingless" >
                    <span className="title ">Set {this.props.id}</span>
                </div>
                <div className="column">
                    <span>Weight (lbs)</span>
                    <input className="input box" type="text"
                        value={this.state.weight} onChange={this.updateWeight} onFocus={this.weightOnFocus}></input>
                </div>
                <div className="column">
                    <span>Number of Reps</span>
                    <input className="input box" type="text"
                        value={this.state.reps} onChange={this.updateReps} onFocus={this.repsOnFocus}></input>
                </div>
                <div className="column has-text-centered is-marginless">
                    <button className="button is-primary set-control "
                        onClick={this.saveWorkout}>
                        Save
                    </button>

                </div>
            </div>
            </div>
        )
    }
}

export default SetWeightGroup;