/// <reference path="workflow-meta.ts" />
/// <reference path="workflow-stage.ts" />

module demoApp {
	'use strict';
	
	export interface IWorkflow extends ICommonMeta {
		parent_id: number;
		description: string;
		dateCreated: string;
		workflowStages: IWorkflowStage[];
		selected: string;
	}
		
	export class Workflow extends CommonMeta implements IWorkflow {
		private _description: string = null;
		private _workflowStages: IWorkflowStage[];
		private _dateCreated: string;
		private _selected: string;
		private _parent_id: number;
		
		constructor(){ 
			super(); 
			this._workflowStages = [];
			this.selected = 'selected';
		}		
		
		get parent_id(): number{ return this._parent_id; }
		
		set parent_id(value: number){ this._parent_id = value; }			
		
		get selected(): string{ return this._selected; }
		
		set selected(value: string){ this._selected = value; }					
	
		get description(): string{ return this._description; }
		
		set description(value: string){ this._description = value; }	
		
		get workflowStages(): IWorkflowStage[]{ return this._workflowStages; }			
		
		set workflowStages(value: IWorkflowStage[]){ this._workflowStages = value; }
		
		get dateCreated(): string{ return this._dateCreated; }
		
		set dateCreated(value: string){ this._dateCreated = value; }
	}	
}