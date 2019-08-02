import WorkoutDocument from './WorkoutDocument'


type FetchFunction = () => Promise<WorkoutDocument[]>; 

export default FetchFunction