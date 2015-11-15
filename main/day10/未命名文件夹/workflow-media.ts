module demoApp {
	'use strict';
	
	export interface IWorkflowMedia {
        id: number;
        parent_id: number;
        image: string;
        name: string;
        date: string;
    }

    export class WorkflowMedia implements IWorkflowMedia {
       private _id: number;
       private _parent_id: number;
       private _image: string = null;
       private _name: string = null;
       private _date: string = null;
       
       constructor(){}
 
 	   get id(): number{ return this._id; }
		
	   set id(value: number){ this._id = value; }
       
	   get parent_id(): number{ return this._parent_id; }
		
	   set parent_id(value: number){ this._parent_id = value; }       
       
       get image(): string{ return this._image; }
       
       set image(value: string){ this._image = value; }
 
       get name(): string{ return this._name; }
       
       set name(value: string){ this._name = value; } 
       
       get date(): string{ return this._date; }
       
       set date(value: string){ this._date = value; }           
    }
}