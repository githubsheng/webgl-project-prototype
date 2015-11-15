/// <reference path="workflow-media.ts" />
var demoApp;
(function (demoApp) {
    'use strict';
    var WorkflowStage = (function () {
        function WorkflowStage() {
            this._id = 0;
            this._no = 0;
            this._name = null;
            this._is_active = false;
            this._is_selected = false;
            this._medias = [];
            this._hasAttachment = false;
            this._comments = [];
        }
        Object.defineProperty(WorkflowStage.prototype, "parent_id", {
            get: function () {
                return this._parent_id;
            },
            set: function (value) {
                this._parent_id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "comments", {
            get: function () {
                return this._comments;
            },
            set: function (value) {
                this._comments = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "no", {
            get: function () {
                return this._no;
            },
            set: function (value) {
                this._no = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "is_active", {
            get: function () {
                return this._is_active;
            },
            set: function (value) {
                this._is_active = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "is_selected", {
            get: function () {
                return this._is_selected;
            },
            set: function (value) {
                this._is_selected = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "medias", {
            get: function () {
                return this._medias;
            },
            set: function (value) {
                this._medias = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "hasAttachment", {
            get: function () {
                return this._hasAttachment;
            },
            set: function (value) {
                this._hasAttachment = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowStage.prototype, "description", {
            get: function () {
                return this._description;
            },
            set: function (value) {
                this._description = value;
            },
            enumerable: true,
            configurable: true
        });
        return WorkflowStage;
    })();
    demoApp.WorkflowStage = WorkflowStage;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-stage.js.map