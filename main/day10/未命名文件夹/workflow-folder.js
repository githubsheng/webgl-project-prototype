/// <reference path="workflow.ts" />
/// <reference path="workflow-brief.ts" />
/// <reference path="workflow-category.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var WorkflowBrief = demoApp.WorkflowBrief;
var Workflow = demoApp.Workflow;
var demoApp;
(function (demoApp) {
    'use strict';
    var WorkflowFolder = (function (_super) {
        __extends(WorkflowFolder, _super);
        function WorkflowFolder() {
            _super.apply(this, arguments);
            this._newCategoryName = null;
        }
        Object.defineProperty(WorkflowFolder.prototype, "workflowBriefs", {
            get: function () {
                return this._workflowBriefs;
            },
            set: function (value) {
                this._workflowBriefs = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowFolder.prototype, "newCategoryName", {
            get: function () {
                return this._newCategoryName;
            } //TODO: (Arjay) remove this getter
            ,
            set: function (value) {
                this._newCategoryName = value;
            } //TODO: (Arjay) remove this setter
            ,
            enumerable: true,
            configurable: true
        });
        return WorkflowFolder;
    })(demoApp.CommonMeta);
    demoApp.WorkflowFolder = WorkflowFolder;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-folder.js.map