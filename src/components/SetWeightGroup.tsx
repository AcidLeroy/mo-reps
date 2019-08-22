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
        this.props.saveWorkout(this.props.id, Number(this.state.weight), Number(this.state.reps))
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        if (prevProps.name !== this.props.name) {
            this.setState({ reps: 0, weight: 0 })
        }
    }

    render() {
        return (
            <div className="field is-grouped-multiline box">
                <div className="subtitle">Set {this.props.id}</div>
                <div className="field">
                    <label className="label">Weight (lbs)</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="e.g. 25"
                            value={this.state.weight} onChange={this.updateWeight} onFocus={this.weightOnFocus} />
                    </div>
                </div>

                <div className="field">

                    <label className="label">Number of Reps</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="e.g. 25"
                            value={this.state.reps} onChange={this.updateReps} onFocus={this.repsOnFocus} />
                    </div>
                </div>


                <div className="field">
                    <div className="control">
                        <button className="is-info is-fullwidth button" onClick={this.saveWorkout}>Save</button>
                    </div>
                </div>

            </div>
        )
    }
}

export default SetWeightGroup;