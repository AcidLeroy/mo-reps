import { LevelUp } from "levelup";
import WorkoutDocument from "./WorkoutDocument";
const R = require('ramda')
const uuidv1 = require('uuid/v1');

const re = /(.*)(-.+){5}/

export function generateWorkoutKey(name :string) {
    return name + "-" + uuidv1();
}

export default class WorkoutDb {
    level: LevelUp;
    constructor(level: LevelUp) {
        this.level = level;
    }

    async fetchAll(): Promise<{ key: string, value: WorkoutDocument }[]> {
        let db = this.level
        let it = db.iterator({ values: true, valueAsBuffer: false, keyAsBuffer: false })

        let p = new Promise<{ key: string, value: WorkoutDocument }[]>((resolve, reject) => {
            let workouts: { key: string, value: WorkoutDocument }[] = [];
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if (k && v) {
                        let m = k.match(re)
                        if (m) {
                            m = m[1];

                            try {
                                workouts.push({ key: k, value: JSON.parse(v) })
                            } catch (e) {
                 
                            
                                console.log('error with data: ', e)
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

    async saveWorkout(workoutId: string | null, document: WorkoutDocument) {

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
            workoutId = generateWorkoutKey(doc.name)
        }

        let db = this.level;
        db.put(workoutId, JSON.stringify(doc));
        return workoutId;
    }

    async listUniqueWorkouts(): Promise<string[]> {
        let db = this.level
        let it = db.iterator({ values: false, keyAsBuffer: false })

        let p = new Promise<string[]>((resolve, reject) => {
            let workouts: string[] = [];
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if (k) {
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

    async getWorkoutsByName(name: string): Promise<{ key: string, value: WorkoutDocument }[]> {
        let db = this.level
        let it = db.iterator({ values: true, valueAsBuffer: false, keyAsBuffer: false, gte: name })

        let p = new Promise<{ key: string, value: WorkoutDocument }[]>((resolve, reject) => {
            let workouts: { key: string, value: WorkoutDocument }[] = [];
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if (k && v) {
                        let m = k.match(re)
                        if (m) {
                            m = m[1];
                            if (m === name) {
                                try {
                                    workouts.push({ key: k, value: JSON.parse(v) })
                                } catch (e) {
                                    console.log('error with data: ', e)
                                }
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

    async renameMuscleGroup(workoutName: string, desiredMuscleGroupName: string): Promise<void> {
        let workouts = await this.getWorkoutsByName(workoutName);

        let ops: any[] = workouts.map(x => {
            let newDoc = Object.assign({}, x.value);
            newDoc.muscleGroup = desiredMuscleGroupName;
            return { type: 'put', key: x.key, value: JSON.stringify(newDoc) }
        })
        this.level.batch(ops)
        return
    }

    async deleteWorkout(workoutName: string): Promise<void> {
        let db = this.level
        let it = db.iterator({ values: false, keyAsBuffer: false, gte: workoutName })

        let p = new Promise<{ type: string, key: string }[]>((resolve, reject) => {
            let deleteList: { type: string, key: string }[] = [];
            let fn = (e: any, k: any, v: any) => {
                if (e) {
                    console.log('Received an error', e)
                    it.end(() => {
                        console.log('Iterator ended.')
                        return reject(e)
                    })
                } else {
                    if (k) {
                        let m = k.match(re)
                        if (m && m[1]) {
                            if (m[1] === workoutName) {
                                console.log('found key ', m[1], 'Adding to list ')
                                deleteList.push({ type: 'del', key: k })
                            }

                        }

                        it.next(fn)
                    } else {
                        it.end(() => {
                            console.log('Successfully fetched keys.')
                            return resolve(deleteList)
                        })
                    }
                }
            }
            it.next(fn)
        })
        let result = await p

        await this.level.batch(result as any[]);
    }
}