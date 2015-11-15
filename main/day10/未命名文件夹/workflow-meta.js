var demoApp;
(function (demoApp) {
    'use strict';
    (function (WorkflowType) {
        WorkflowType[WorkflowType["CATEGORY"] = 0] = "CATEGORY";
        WorkflowType[WorkflowType["GROUP"] = 1] = "GROUP";
    })(demoApp.WorkflowType || (demoApp.WorkflowType = {}));
    var WorkflowType = demoApp.WorkflowType;
    var CommonMeta = (function () {
        function CommonMeta() {
            this._name = null;
        }
        Object.defineProperty(CommonMeta.prototype, "id", {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommonMeta.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommonMeta.prototype, "type", {
            get: function () {
                return this._type;
            },
            set: function (value) {
                this._type = value;
            },
            enumerable: true,
            configurable: true
        });
        return CommonMeta;
    })();
    demoApp.CommonMeta = CommonMeta;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-meta.js.map