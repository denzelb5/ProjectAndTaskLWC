/**
 * Created by Denise.Baker on 4/13/24.
 */

public with sharing class ProjectListController {
    @AuraEnabled(Cacheable=true)
    public static List<Project__c> getProjects() {
        List<Project__c> projects = [
                SELECT
                        Id,
                        Name,
                        CreatedDate,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        (
                                SELECT
                                        Id,
                                        Name,
                                        Description__c,
                                        DueDate__c,
                                        Status__c,
                                        Project__c
                                FROM Tasks__r
                                ORDER BY CreatedDate DESC
                        )
                FROM Project__c
                ORDER BY CreatedDate DESC
        ];
        return projects;
    }

    @AuraEnabled(Cacheable=true)
    public static Project__c getSelectedProject(String projectId) {
        Project__c project = [
                SELECT
                        Id,
                        Name,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        (
                                SELECT
                                        Id,
                                        Name,
                                        CreatedDate,
                                        Description__c,
                                        DueDate__c,
                                        Status__c,
                                        Project__c
                                FROM Tasks__r
                                ORDER BY CreatedDate DESC
                        )
                FROM Project__c
                WHERE Id = :projectId
        ];
        return project;
    }

    @AuraEnabled(Cacheable=true)
    public static List<Task__c> getTasksByProjectId(String projectId) {
        List<Task__c> tasks = [
                SELECT
                        Id,
                        Name,
                        CreatedDate,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        Project__c,
                        Project__r.Name
                FROM Task__c
                WHERE Project__c = :projectId
                ORDER BY CreatedDate DESC
        ];
        return tasks;
    }


    @AuraEnabled(Cacheable=true)
    public static List<Task__c> getTasks() {
        List<Task__c> tasks = [
                SELECT
                        Id,
                        Name,
                        CreatedDate,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        Project__c,
                        Project__r.Name
                FROM Task__c
                ORDER BY CreatedDate DESC
        ];
        return tasks;
    }

    @AuraEnabled
    public static void createProjectRecords(ProjectWrapper projectInfo) {
        List<Project__c> projectsToInsert = new List<Project__c>();
        if (projectInfo != null) {
            projectsToInsert.add(convertWrapperProjectInfo(projectInfo));
        }

        if (projectsToInsert.size() > 0) {
            DML_Helper.insertSObjects(projectsToInsert, false);
        }

    }

    @AuraEnabled
    public static void updateProjectRecords(String projectId, ProjectWrapper projectInfo) {
        List<Project__c> projectsToUpdate = new List<Project__c>();
        if (projectInfo != null) {
            projectsToUpdate.add(convertWrapperProjectInfo(projectInfo));
        }

        if (projectsToUpdate.size() > 0) {
            DML_Helper.updateSObjects(projectsToUpdate, false);
        }

    }

    @AuraEnabled
    public static void deleteProjectRecord(Project__c project) {
        Project__c project2Delete = [
                SELECT
                        Id,
                        Name,
                        (SELECT Id FROM Tasks__r)
                FROM Project__c
                WHERE Id = :project.Id
        ];
        List<Project__c> projectsToDelete = new List<Project__c>();
        projectsToDelete.add(project2Delete);
        DML_Helper.deleteSObjects(projectsToDelete, false);

    }

    @AuraEnabled(Cacheable=true)
    public static Task__c getSelectedTask(String taskId) {
        Task__c task1 = [
                SELECT
                        Id,
                        Name,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        Project__c,
                        Project__r.Name
                FROM Task__c
                WHERE Id = :taskId
        ];
        return task1;
    }


    @AuraEnabled
    public static void deleteTask(String taskId) {
        Task__c task1 = [SELECT Id FROM Task__c WHERE Id = :taskId];
        List<Task__c> tasksToDelete = new List<Task__c>();
        tasksToDelete.add(task1);
        DML_Helper.deleteSObjects(tasksToDelete, false);
    }

    private static Project__c convertWrapperProjectInfo(ProjectWrapper wrapper) {
        Project__c project = new Project__c();
        project.Id = wrapper.recordId;
        project.Name = wrapper.name;
        project.Description__c = wrapper.description;
        project.DueDate__c = wrapper.dueDate;
        project.Status__c = wrapper.status;

        return project;
    }

    public class ProjectWrapper {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Date dueDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String recordId { get; set; }
    }

}