<<<<<<< HEAD
import { WorkArea } from './work-area.model';

export class Agv {
    private progress = 0
    private error = false

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    public getProgress(): number {
        return Number(this.progress.toFixed(2));
    }
    public setProgress(value: number) {
        this.progress = value;
    }
    public getError(): boolean {
        return this.error;
    }
    public setError(value: boolean) {
        this.error = value;
    }

    constructor(private _id: number) {
    }
}
=======
import { WorkArea } from './work-area.model';

export class Agv {
    private progress = 0
    private error = false

    public get id(): number {
        return this._id;
    }
    public set id(value: number) {
        this._id = value;
    }

    public getProgress(): number {
        return Number(this.progress.toFixed(2));
    }
    public setProgress(value: number) {
        this.progress = value;
    }
    public getError(): boolean {
        return this.error;
    }
    public setError(value: boolean) {
        this.error = value;
    }

    constructor(private _id: number) {
    }
}
>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
