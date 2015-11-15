/// <reference path="workflow-media.ts" />

module demoApp {
	'use strict';
	
	export interface IStageComment{
		comment: string;
	}
	
	export interface IWorkflowStage {
		id: number;
        no: number;
        name: string;
        is_active: boolean;
        is_selected: boolean;
		medias: IWorkflowMedia[];
		hasAttachment: boolean;
		description: string;
		comments: IStageComment[];
    }	
	
	export class WorkflowStage implements IWorkflowStage {
		private _id: number;
		private _parent_id: number;
		private _no: number;
		private _name: string;
		private _is_active: boolean;
		private _is_selected: boolean;
		private _medias: IWorkflowMedia[];
		private _hasAttachment: boolean;
		private _description: string;
		private _comments: IStageComment[];
		
		constructor(){
			this._id = 0;
			this._no = 0;
			this._name = null;
			this._is_active = false;
			this._is_selected = false;
			this._medias = [];
			this._hasAttachment = false;
			this._comments = [];
		}
		
		get parent_id(): number{ return this._parent_id; }
		
		set parent_id(value: number){ this._parent_id = value; }
		
		get id(): number{ return this._id; }
		
		set id(value: number){ this._id = value; }
		
		get comments(): IStageComment[]{ return this._comments; }
		
		set comments(value: IStageComment[]){ this._comments = value; }		
		
		get no(): number{ return this._no; }
		
		set no(value: number){ this._no = value; }
		
		get name(): string{ return this._name; }
		
		set name(value: string){ this._name = value; }
		
		get is_active(): boolean{ return this._is_active; }
		
		set is_active(value: boolean){ this._is_active = value; }
		
		get is_selected(): boolean{ return this._is_selected; }
		
		set is_selected(value: boolean){ this._is_selected = value; }		
		
		get medias(): IWorkflowMedia[]{ return this._medias; }
		
		set medias(value: IWorkflowMedia[]){ this._medias = value; }
		
		get hasAttachment(): boolean{ return this._hasAttachment; }
		
		set hasAttachment(value: boolean){ this._hasAttachment = value; }	
		
		get description(): string{ return this._description; }
		
		set description(value: string){ this._description = value; }	
	}		
}