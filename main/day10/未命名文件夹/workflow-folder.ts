/// <reference path="workflow.ts" />
/// <reference path="workflow-brief.ts" />
/// <reference path="workflow-category.ts" />

import WorkflowBrief = demoApp.WorkflowBrief;
import Workflow = demoApp.Workflow;


module demoApp {
	'use strict';
	
	export interface IWorkflowFolder extends ICommonMeta {
		workflowBriefs: WorkflowBrief[];
		newCategoryName: string; //TODO: (Arjay) remove this property
	}	
	
	export class WorkflowFolder extends CommonMeta implements IWorkflowFolder {
		private _workflowBriefs: WorkflowBrief[];
		private _newCategoryName: string = null;

		get workflowBriefs():WorkflowBrief[] {
			return this._workflowBriefs;
		}
		set workflowBriefs(value:WorkflowBrief[]) {
			this._workflowBriefs = value;
		}

		get newCategoryName(): string{ return this._newCategoryName; } //TODO: (Arjay) remove this getter
		
		set newCategoryName(value: string){ this._newCategoryName = value; } //TODO: (Arjay) remove this setter
	}	
}