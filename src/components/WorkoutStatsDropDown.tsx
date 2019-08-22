import React, { Component } from 'react';
import 'bulma/css/bulma.css'
import WorkoutDocument from '../WorkoutDocument';
import StatEntry from './StatEntry'
const R = require('ramda')
const moment = require('moment')

interface Props {
    workouts: WorkoutDocument[]
}

interface State {
    isExpanded: boolean
    maxWeight: number,
    daysSinceLastSet: string,
    daysSinceMax: string,
    totalSets: number,
    averageWeight: number

}

class WorkoutStatsDropDown extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            isExpanded: false,
            maxWeight: 0,
            daysSinceLastSet: "",
            daysSinceMax: "",
            totalSets: 0,
            averageWeight: 0
        }
        this.toggleStats = this.toggleStats.bind(this)
    }


    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        if (prevProps.workouts.length > 0 && this.props.workouts.length > 0) {
            if (prevProps.workouts[0].name !== this.props.workouts[0].name) {
                this.setState({ isExpanded: false })
            }
        }
        if (!R.equals(this.props.workouts, prevProps.workouts)) {
            if (this.props.workouts.length <= 0) {
                this.setState({
                    isExpanded: false,
                    maxWeight: 0,
                    daysSinceLastSet: "",
                    daysSinceMax: "",
                    totalSets: 0,
                    averageWeight: 0
                })
                return;
            };
            let weights = R.map(R.prop('weight'), this.props.workouts)

            let max = R.reduce(R.max, 0, weights);
            let totalReps = R.reduce((a: any, b: any) => a + b.reps, 0, this.props.workouts)


            let sum = R.reduce((a: any, b: any) => a + (b.weight! * b.reps!),
                0, this.props.workouts)
            console.log('total reps = ', totalReps, ' sum = ', sum)
            let avg = sum / totalReps;
            let dates = R.sort((a: any, b: any) => a - b, R.map(R.prop('date'), this.props.workouts))
            let now = moment()
            let maxDate = moment.unix(dates[dates.length - 1] / 1000)
            let duration = moment.duration(now.diff(maxDate)).days()
            let a = R.reduce((a: any, b: any) => a.weight > b.weight ? a : b,
                this.props.workouts[0], this.props.workouts)
            let b = moment.unix(a.date / 1000)
            let durationMax = moment.duration(now.diff(b)).days()

            this.setState({ totalSets: this.props.workouts.length })
            this.setState({ maxWeight: max })
            this.setState({ averageWeight: avg })
            this.setState({ daysSinceLastSet: duration })
            this.setState({ daysSinceMax: durationMax })
        }
    }

    toggleStats() {
        this.setState({ isExpanded: !this.state.isExpanded })
    }



    render() {
        const icon = this.state.isExpanded ? "fas fa-angle-down" : "fas fa-angle-left"
        return (
            <div className="container has-background-light box">
                <button className="button is-fullwidth is-outlined is-info" onClick={this.toggleStats}>
                    <span>{this.state.isExpanded ? "Hide Statistics" : "Show Statistics"}</span>
                    {this.state.isExpanded? (
                    <span key={icon} className="icon">
                        <i className={icon}></i>
                    </span>
                    ) : (
                        <span key={icon} className="icon">
                        <i className={icon}></i>
                    </span> 
                    )}
 
                </button>
                {this.state.isExpanded ? (
                    <div>
                        <StatEntry name="Max Weight (lbs)" value={String(this.state.maxWeight)} />
                        <StatEntry name="Days Since Max" value={this.state.daysSinceMax} />
                        <StatEntry name="Days Since Last Set" value={this.state.daysSinceLastSet} />
                        <StatEntry name="Total Sets" value={String(this.state.totalSets)} />
                        <StatEntry name="Average Weight (lbs)" value={String(Math.floor(this.state.averageWeight))} />
                    </div>
                ) : null}
            </div>
        )

    }

}

export default WorkoutStatsDropDown;