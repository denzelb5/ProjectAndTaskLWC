/**
 * Created by Denise.Baker on 4/14/24.
 */

public with sharing class UpdateProjectAndTaskStatusBatch implements Database.Batchable<SObject>, Database.Stateful, Schedulable {
    public String query;
    public Decimal batchSize = 200;

    // retrieve query stored in custom metadata to set data for batch
    // set batch size
    public UpdateProjectAndTaskStatusBatch() {
        Batch_Setting__mdt batchSettings = [
                SELECT
                        Id,
                        Query_String__c,
                        Batch_Size__c
                FROM Batch_Setting__mdt
                WHERE Class_Name__c = 'UpdateProjectAndTaskStatusBatch'
                AND Object_Name__c = 'Project__c'
        ];
        batchSize = batchSettings.Batch_Size__c != null ? batchSettings.Batch_Size__c : batchSize;
        query = batchSettings.Query_String__c;
    }

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext bc, List<Project__c> scope) {
        List<Project__c> projectsToUpdate = new List<Project__c>();
        List<Task__c> retrievedTasks = new List<Task__c>();
        List<Task__c> tasksToUpdate = new List<Task__c>();
        Map<Id, List<Task__c>> projectToTaskMap = new Map<Id, List<Task__c>>();

        for (Project__c project : scope) {
            if (project.DueDate__c < System.today() && project.DueDate__c != null && project.Status__c != 'Overdue') {
                project.Status__c = 'Overdue';
                projectsToUpdate.add(project);
            }
            projectToTaskMap.put(project.Id, project.Tasks__r);
        }

        for (String projectId : projectToTaskMap.keySet()) {
            retrievedTasks.addAll(projectToTaskMap.get(projectId));
        }

        for (Task__c task1 : retrievedTasks) {
            if (task1.DueDate__c < System.today() && task1.DueDate__c != null && task1.Status__c != 'Overdue') {
                task1.Status__c = 'Overdue';
                tasksToUpdate.add(task1);
            }
        }

        if (projectsToUpdate.size() > 0) {
            DML_Helper.updateSObjects(projectsToUpdate, true);
        }

        if (tasksToUpdate.size() > 0) {
            DML_Helper.updateSObjects(tasksToUpdate, true);
        }
    }

    public void finish(Database.BatchableContext bc) {
        //do nothing
    }

    public void execute(SchedulableContext context) {
        UpdateProjectAndTaskStatusBatch batch = new UpdateProjectAndTaskStatusBatch();
        Database.executeBatch(batch, 200);
    }

    // Schedule
    /*
    UpdateProjectAndTaskStatusBatch clsAlerts = new UpdateProjectAndTaskStatusBatch();
    String schAlerts = '0 0 1 * * ?';
    String jobIdAlerts = System.schedule('UpdateProjectAndTaskStatusBatch', schAlerts, clsAlerts);
*/
}