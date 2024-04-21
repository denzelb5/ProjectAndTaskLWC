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
                        )
                FROM Project__c
        ];
        System.debug('projects ' + projects);
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
                                        Description__c,
                                        DueDate__c,
                                        Status__c,
                                        Project__c
                                FROM Tasks__r
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
                        Description__c,
                        DueDate__c,
                        Status__c,
                        Project__c,
                        Project__r.Name
                FROM Task__c
                WHERE Project__c = :projectId
        ];
        return tasks;
    }


    @AuraEnabled(Cacheable=true)
    public static List<Task__c> getTasks() {
        List<Task__c> tasks = [
                SELECT
                        Id,
                        Name,
                        Description__c,
                        DueDate__c,
                        Status__c,
                        Project__c,
                        Project__r.Name
                FROM Task__c
        ];
        return tasks;
    }

    @AuraEnabled
    public static void createProjectRecords(ProjectWrapper projectInfo) {
        System.debug('projectInfo ' + projectInfo);
        List<Project__c> projectsToInsert = new List<Project__c>();
        if (projectInfo != null) {
            projectsToInsert.add(convertWrapperProjectInfo(projectInfo));
        }

        if (projectsToInsert.size() > 0) {
            try {
                DML_Helper.insertSObjects(projectsToInsert, false);
            } catch(Exception e) {
                System.debug('Failed to insert project info ' + e.getMessage());
            }
        }

    }

    @AuraEnabled
    public static void updateProjectRecords(String projectId, ProjectWrapper projectInfo) {
        System.debug('projectInfo ' + projectInfo);
        System.debug('projectId in update ' + projectId);
//        Project__c projectToUpdate = [SELECT Id FROM Project__c WHERE Id = :projectId];
        List<Project__c> projectsToUpdate = new List<Project__c>();
        if (projectInfo != null) {
            projectsToUpdate.add(convertWrapperProjectInfo(projectInfo));
        }

        if (projectsToUpdate.size() > 0) {
            try {
                DML_Helper.updateSObjects(projectsToUpdate, false);
            } catch(Exception e) {
                System.debug('Failed to update project info ' + e.getMessage());
            }
        }

    }

    @AuraEnabled
    public static void deleteProjectRecord(String delRecId){
        try {
            Project__c project = [SELECT Id FROM Project__c WHERE Id = :delRecId];
            List<Project__c> projectsToDelete = new List<Project__c>();
            projectsToDelete.add(project);
            DML_Helper.deleteSObjects(projectsToDelete, false);
        } catch(Exception e) {
            System.debug('Error occurred during delete record \n' + e.getMessage() + '\n'+e.getStackTraceString());
        }
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
        System.debug('task1 ' + task1);
        return task1;
    }

    @AuraEnabled
    public static void createTask(TaskWrapper taskInfo) {
        System.debug('taskInfo ' + taskInfo);
        List<Task__c> tasksToInsert = new List<Task__c>();
        if (taskInfo != null) {
            tasksToInsert.add(convertWrapperTaskInfo(taskInfo));
        }

        if (tasksToInsert.size() > 0) {
            try {
                DML_Helper.insertSObjects(tasksToInsert, false);
            } catch(Exception e) {
                System.debug('Failed to insert task info ' + e.getMessage());
            }
        }

    }

    @AuraEnabled
    public static void updateTasks(String taskId, TaskWrapper taskInfo) {
        System.debug('taskInfo ' + taskInfo);
        System.debug('projectId in update ' + taskId);
//        Project__c projectToUpdate = [SELECT Id FROM Project__c WHERE Id = :projectId];
        List<Task__c> tasksToUpdate = new List<Task__c>();
        if (taskInfo != null) {
            tasksToUpdate.add(convertWrapperTaskInfo(taskInfo));
        }

        if (tasksToUpdate.size() > 0) {
            try {
                DML_Helper.updateSObjects(tasksToUpdate, false);
            } catch(Exception e) {
                System.debug('Failed to update task info ' + e.getMessage());
            }
        }

    }

    @AuraEnabled
    public static void deleteTask(String taskId){
        try {
            Task__c task1 = [SELECT Id FROM Task__c WHERE Id = :taskId];
            List<Task__c> tasksToDelete = new List<Task__c>();
            tasksToDelete.add(task1);
            DML_Helper.deleteSObjects(tasksToDelete, false);
        } catch(Exception e) {
            System.debug('Error occurred during delete record \n' + e.getMessage() + '\n'+e.getStackTraceString());
        }
    }

    @AuraEnabled(Cacheable=true)
    public static List<SObject> search(String myObject, String searchTerm, String filter) {
        String myQuery = 'SELECT Id, Name from ' + myObject;

        if (String.isNotBlank(searchTerm)) {
            myQuery += ' WHERE Name Like  \'%' + searchTerm + '%\' ';
        }
        if (String.isNotBlank(filter)) {
            myQuery += (myQuery.contains('WHERE') ? 'AND ' : ' WHERE ') + filter + ' ';
        }
        myQuery += ' ORDER BY Name DESC';

        List<SObject> response = Database.query(myQuery);
        return response;
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

    private static Task__c convertWrapperTaskInfo(TaskWrapper wrapper) {
        Task__c task1 = new Task__c();
        task1.Id = wrapper.recordId;
        task1.Name = wrapper.name;
        task1.Description__c = wrapper.description;
        task1.DueDate__c = wrapper.dueDate;
        task1.Status__c = wrapper.status;
        task1.Project__c = wrapper.project;

        return task1;
    }

    public class ProjectWrapper {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Date dueDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String recordId { get; set; }
    }

    public class TaskWrapper {
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public String description { get; set; }
        @AuraEnabled public Date dueDate { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String project { get; set; }
        @AuraEnabled public String recordId { get; set; }
    }

}