/// <reference path="workflow-meta.ts" />
/// <reference path="workflow-stage.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var demoApp;
(function (demoApp) {
    'use strict';
    var Workflow = (function (_super) {
        __extends(Workflow, _super);
        function Workflow() {
            _super.call(this);
            this._description = null;
            this._workflowStages = [];
            this.selected = 'selected';
        }
        Object.defineProperty(Workflow.prototype, "parent_id", {
            get: function () {
                return this._parent_id;
            },
            set: function (value) {
                this._parent_id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Workflow.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            set: function (value) {
                this._selected = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Workflow.prototype, "description", {
            get: function () {
                return this._description;
            },
            set: function (value) {
                this._description = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Workflow.prototype, "workflowStages", {
            get: function () {
                return this._workflowStages;
            },
            set: function (value) {
                this._workflowStages = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Workflow.prototype, "dateCreated", {
            get: function () {
                return this._dateCreated;
            },
            set: function (value) {
                this._dateCreated = value;
            },
            enumerable: true,
            configurable: true
        });
        return Workflow;
    })(demoApp.CommonMeta);
    demoApp.Workflow = Workflow;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-workflow.js.map