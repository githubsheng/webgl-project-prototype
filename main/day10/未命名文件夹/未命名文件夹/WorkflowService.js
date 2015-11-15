/**
 * Created by wangsheng on 11/11/15.
 */
/// <reference path="../../../../tools/typings/angularjs/angular.d.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-category.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-folder.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-brief.ts" />
var WorkflowFolder = demoApp.WorkflowFolder;
var Workflow = demoApp.Workflow;
var Stage = demoApp.WorkflowStage;
var ReferenceFile = demoApp.WorkflowMedia;
angular.module("backend_bridge").factory("workflow_service", ["$http", function ($http) {
    function getWorkflowById(workflowId) {
        var r = null;
        $http.get("workflow/get", { params: { id: workflowId } }).then(function (data) {
            var workflow = new Workflow();
            workflow.id = data.meta.id;
            workflow.name = data.meta.name;
            workflow.description = data.meta.description;
            workflow.workflowStages = [];
            //set stages.
            data.stages.forEach(function (s) {
                var stage = new Stage();
                workflow.workflowStages.push(stage);
                stage.id = s.meta.id;
                stage.name = s.meta.name;
                stage.description = s.meta.description;
                stage.no = s.order;
                stage.medias = [];
                //set reference files
                s.referenceFiles.forEach(function (rf) {
                    var referenceFile = new ReferenceFile();
                    stage.medias.push(referenceFile);
                    referenceFile.id = rf.id;
                    referenceFile.name = rf.fileName;
                });
            });
            r = workflow;
        });
        return r;
    }
    function getWorkflowFolders(organizationId) {
        var r = [];
        $http.get("workflow/list", { params: { oid: organizationId } }).then(function (data) {
            data.forEach(function (g) {
                var folder = new WorkflowFolder();
                r.push(folder);
                folder.id = g.id;
                folder.name = g.name;
                folder.workflowBriefs = [];
                g.workflows.forEach(function (b) {
                    var brief = new WorkflowBrief(b.id, b.name, b.description);
                    folder.workflowBriefs.push(brief);
                });
            });
        });
        return r;
    }
    return {
        getWorkflowFolders: getWorkflowFolders,
        getWorkflowById: getWorkflowById,
        createNewWorkflow: null,
        removeWorkflow: null,
        submitWorkflow: null,
        updateWorkflowName: null,
        updateWorkflowDescription: null
    };
}]);
//# sourceMappingURL=WorkflowService.js.map