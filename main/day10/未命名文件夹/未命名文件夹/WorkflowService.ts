/**
 * Created by wangsheng on 11/11/15.
 */

/// <reference path="../../../../tools/typings/angularjs/angular.d.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-workflow.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-folder.ts" />
/// <reference path="../../components/dashboards/workflow/models/workflow-brief.ts" />

import WorkflowFolder = demoApp.WorkflowFolder;
import Workflow = demoApp.Workflow;
import Stage = demoApp.WorkflowStage;
import ReferenceFile = demoApp.WorkflowMedia;

interface WorkflowService {
    getWorkflowFolders: (organizationId:number) => WorkflowFolder[];
    createNewWorkflowFolder: (organizationId: number, name: string) => WorkflowFolder;
    removeWorkflowFolder: (workflowFolderId: number) => void;
    moveWorkflowToFolder: (workflowId: number, workflowFolderId: number) => void;

    getWorkflowById: (workflowId:number) => Workflow;
    createNewWorkflow: (organizationId: number, workflowId: number) => Workflow;
    removeWorkflow: (workflowId: number) => void;
    submitWorkflow: (workflowId: number) => void;
    updateWorkflowName: (workflowId: number, name: string) => void;
    updateWorkflowDescription: (workflowId: number, description: string) => void;

}

angular.module("backend_bridge").factory("workflow_service", ["$http", function ($http:ng.IHttpService):WorkflowService {

    function getWorkflowFolders(organizationId:number):WorkflowFolder[] {

        var r:WorkflowFolder[] = [];

        $http.get("workflow/list", {params: {oid: organizationId}}).then(function (data:any) {


            data.forEach(function (g) {
                var folder:WorkflowFolder = new WorkflowFolder();
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

    function getWorkflowById(workflowId:number):Workflow {

        var r:Workflow = null;

        $http.get("workflow/get", {params: {id: workflowId}}).then(function (data:any) {

            var workflow:Workflow = new Workflow();
            workflow.id = data.meta.id;
            workflow.name = data.meta.name;
            workflow.description = data.meta.description;
            workflow.workflowStages = [];

            //set stages.
            data.stages.forEach(function (s) {
                var stage:Stage = new Stage();

                workflow.workflowStages.push(stage);

                stage.id = s.meta.id;
                stage.name = s.meta.name;
                stage.description = s.meta.description;
                stage.no = s.order;
                stage.medias = [];

                //set reference files
                s.referenceFiles.forEach(function (rf) {
                    var referenceFile:ReferenceFile = new ReferenceFile();

                    stage.medias.push(referenceFile);

                    referenceFile.id = rf.id;
                    referenceFile.name = rf.fileName;
                });

            });

            r = workflow;
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
    }

}]);