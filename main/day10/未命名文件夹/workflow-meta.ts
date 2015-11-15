module demoApp {
	'use strict';
	
	export enum WorkflowType {
		CATEGORY,
		GROUP
	}
	
	export interface ICommonMeta {
		id: number;
		name: string;
		type: WorkflowType;	
	}	
	
	export class CommonMeta implements ICommonMeta {
		private _name: string = null;
		private _type: WorkflowType;
		private _id: number;
		
		constructor(){	}	
		
		get id(): number{ return this._id; }
		
		set id(value: number){ this._id = value; }			
		
		get name(): string{ return this._name; }
		
		set name(value: string){ this._name = value; }
		
		get type(): WorkflowType{ return this._type; }
		
		set type(value: WorkflowType){ this._type = value; }			
	}	
}