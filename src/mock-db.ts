import  { LevelUp } from 'levelup'
const uuidv1 = require('uuid/v1');

export default function populateDb(db : LevelUp) : void {
    let p : any[] = []
    let workouts = mockFetchWorkouts()
    workouts.forEach(x => {
        let key = x.name +"-"+ uuidv1()  
        let value = x
        p.push(db.put(key, value))
    })

}

function mockFetchWorkouts(){

    let date = Date.now()
    return [
        {
            date: date++, 
            name: "bench press", 
            set: 1, 
            weight: 100,
            reps: 8,
            units: "lbs", 
            muscleGroup: "chest"
        }, 
        {
            date: date++, 
            name: "bench press", 
            set: 2, 
            weight: 110,
            reps: 3, 
            units: "lbs", 
            muscleGroup: "chest"
        }, 
        {
            date: date++, 
            name: "bench press", 
            set: 3,
            reps: 12,  
            weight: 100,
            units: "lbs", 
            muscleGroup: "chest"
        }, 
        {
            date: date++, 
            name: "bench press", 
            set: 4, 
            weight: 100,
            reps: 11, 
            units: "lbs", 
            muscleGroup: "chest"
        }, 
        {
            date: date++, 
            name: "squat", 
            set: 1, 
            weight: 200, 
            reps: 12, 
            units: "lbs", 
            muscleGroup: "legs"
        }, 
        {
            date: date++, 
            name: "squat", 
            set: 2, 
            weight: 220, 
            reps: 12, 
            units: "lbs",
            muscleGroup: "legs"
        }, 
        {
            date: date++, 
            name: "my awesome exercise", 
            set: 1, 
            weight: 10, 
            reps: 12, 
            units: "lbs", 
            muscleGroup: "neck"
        }, 
        {
            date: date++, 
            name: "my awesome exercise", 
            set: 1, 
            weight: 10, 
            reps: 12, 
            units: "lbs",
            muscleGroup: "neck"
        }
    ]
}