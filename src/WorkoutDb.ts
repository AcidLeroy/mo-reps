import { LevelUp } from "levelup";
import WorkoutDocument from "./WorkoutDocument";
const R = require('ramda')
const uuidv1 = require('uuid/v1');

const re = /(.*)(-.+){5}/

export default class WorkoutDb {
    level: LevelUp;
    constructor(level: LevelUp) {
        this.level = level;
    }

    async saveWorkout(workoutId: string | null, document: WorkoutDocument){
        
        let doc = {
            date: document.date || Date.now(),
            name: document.name || "unknown", 
            set: document.set || -1, 
            weight: document.weight || 0, 
            reps: document.reps || 0, 
            units: document.units || "lbs", 
            muscleGroup: document.muscleGroup || "unkown"
        }

        if (workoutId == null) {
            workoutId = doc.name + "-" + uuidv1();
        }

        let db = this.level; 
        db.put(workoutId, JSON.stringify(doc)); 
        return workoutId; 
    }

    async listUniqueWorkouts(): Promise<string[]> {
        let db = this.level
        let it = db.iterator({ values: false, keyAsBuffer: false })
        
        let p = new Promise<string[]>((resolve, reject) => {
            let workouts :string[]= []; 
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if(k) {
                        k = k.match(re)[1]
                        workouts.push(k)
                        it.next(fn)
                    } else {
                        it.end(() => {
                            console.log('Successfully fetched keys.')
                            return resolve(workouts)
                        })
                    }
                }
            }
            it.next(fn)
        })
        let workouts = await p; 
        return R.uniq(workouts) 
    }

    async getWorkoutsByName(name: string) : Promise<{key: string, value: WorkoutDocument}[]>{
        let db = this.level
        let it = db.iterator({ values: true, valueAsBuffer: false, keyAsBuffer: false, gte: name })
        
        let p = new Promise<{key: string, value: WorkoutDocument}[]>((resolve, reject) => {
            let workouts :{key: string, value: WorkoutDocument}[]= []; 
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if(k && v) {
                        let m = k.match(re)
                        if (m){
                        m = m[1]; 
                        if(m === name){
                            workouts.push({key: k, value: JSON.parse(v)})
                        }
                    }
                        it.next(fn)
                    } else {
                        it.end(() => {
                            console.log('Successfully fetched keys.')
                            return resolve(workouts)
                        })
                    }
                }
            }
            it.next(fn)
        })
        let workouts = await p; 
        return workouts
    }

    async renameMuscleGroup(workoutName: string, desiredMuscleGroupName: string) : Promise<void>{
        let workouts = await this.getWorkoutsByName(workoutName);
        let ops :any[]  = []
         workouts.map(x => {
            let newDoc = Object.assign({}, x.value); 
            newDoc.muscleGroup = desiredMuscleGroupName; 
            ops.push({type: 'put', key: x.key, value: newDoc})
         })
         this.level.batch(ops)
         return 
    }
}