import React, { Component } from 'react';
import 'bulma/css/bulma.css'
import './EditableMuscleGroup.css'

interface Props {
    muscleGroup: string,
    updateGroup: (updatedMuscleGroup : string) => void
}

interface State {
    updatedMuscleGroup: string,
    isEditing: boolean
}

class EditableMuscleGroup extends Component<Props, State> {
    constructor(props: Readonly<Props>) {
        super(props)
        this.state = {
            updatedMuscleGroup: "",
            isEditing: false
        }
        this.toggleEdit = this.toggleEdit.bind(this); 
        this.saveGroup = this.saveGroup.bind(this); 
        this.updateMuscleGroupText= this.updateMuscleGroupText.bind(this); 
    }

    saveGroup(){
        this.props.updateGroup(this.state.updatedMuscleGroup)
        this.toggleEdit()
    }

    updateMuscleGroupText(event: any){
        this.setState({updatedMuscleGroup: event.currentTarget.value})
    }
    
    toggleEdit() {
        this.setState({isEditing: !this.state.isEditing})
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
        if (prevProps.muscleGroup !== this.props.muscleGroup){
            this.setState({isEditing: false, updatedMuscleGroup: ""})
        }
    }

    render() {
        if (this.state.isEditing) {
            return (
                <div className="columns box editable-muscle-group" >
                    <div className="column">
                        <input type="text" className="input" value={this.state.updatedMuscleGroup}
                             onChange={this.updateMuscleGroupText} placeholder={this.props.muscleGroup}></input>
                    </div> 
                    <div className="column">
                        <button className="button is-primary" onClick={this.saveGroup}>Save</button>
                        <button className="button" onClick={this.toggleEdit}>Cancel</button>
                    </div>
                </div> 
            )
        } else {
            return (
            <button className="button" onClick={this.toggleEdit}>
                <span className="icon is-small">
                    <i className="fas fa-edit"></i>
                </span>
                <span>Muscle group: {this.props.muscleGroup} </span>
            </button>
            )
        }
    }
}

export default EditableMuscleGroup;