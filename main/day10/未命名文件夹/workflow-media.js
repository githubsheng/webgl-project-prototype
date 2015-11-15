var demoApp;
(function (demoApp) {
    'use strict';
    var WorkflowMedia = (function () {
        function WorkflowMedia() {
            this._image = null;
            this._name = null;
            this._date = null;
        }
        Object.defineProperty(WorkflowMedia.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowMedia.prototype, "parent_id", {
            get: function () {
                return this._parent_id;
            },
            set: function (value) {
                this._parent_id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowMedia.prototype, "image", {
            get: function () {
                return this._image;
            },
            set: function (value) {
                this._image = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowMedia.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowMedia.prototype, "date", {
            get: function () {
                return this._date;
            },
            set: function (value) {
                this._date = value;
            },
            enumerable: true,
            configurable: true
        });
        return WorkflowMedia;
    })();
    demoApp.WorkflowMedia = WorkflowMedia;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-media.js.map