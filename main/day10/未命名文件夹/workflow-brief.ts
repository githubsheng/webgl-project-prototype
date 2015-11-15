/**
 * Created by wangsheng on 12/11/15.
 */

module demoApp {
    export class WorkflowBrief {
        private _id: number;
        private _name: string;
        private _description: string;

        constructor(id:number, name:string, description:string) {
            this._id = id;
            this._name = name;
            this._description = description;
        }

        public get id():number {
            return this._id;
        }

        public get name():string {
            return this._name;
        }

        public set name(value:string) {
            this._name = value;
        }
    }
}