/**
 * Created by wangsheng on 12/11/15.
 */
var demoApp;
(function (demoApp) {
    var WorkflowBrief = (function () {
        function WorkflowBrief(id, name, description) {
            this._id = id;
            this._name = name;
            this._description = description;
        }
        Object.defineProperty(WorkflowBrief.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WorkflowBrief.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        return WorkflowBrief;
    })();
    demoApp.WorkflowBrief = WorkflowBrief;
})(demoApp || (demoApp = {}));
//# sourceMappingURL=workflow-brief.js.map