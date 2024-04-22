/**
 * Created by Denise.Baker on 4/13/24.
 */

@IsTest
private class ProjectListControllerTest {
    @TestSetup
    static void testDataSetup() {

        List<Project__c> testProjects = new List<Project__c>();
        for (Integer i = 0; i < 5; i++) {
            Project__c testProject = new Project__c(
                    Name = 'Project' + i,
                    Description__c = 'Desc' + i,
                    DueDate__c = System.today().addDays(i),
                    Status__c = 'New'
            );
            testProjects.add(testProject);
        }
        insert testProjects;

        List<Task__c> testTaskList = new List<Task__c>();
        for (Integer i = 0; i < 5; i++) {
            Task__c testTask = new Task__c(
                    Name = 'Task' + i,
                    Description__c = 'Desc' + i,
                    DueDate__c = System.today().addDays(i),
                    Status__c = 'New',
                    Project__c = testProjects[i].Id
            );
            testTaskList.add(testTask);
        }
        insert testTaskList;

    }

    @IsTest
    static void testGetProjects() {
        Test.startTest();
        List<Project__c> projects = ProjectListController.getProjects();
        Test.stopTest();
        System.assertEquals(projects.size(), 5);
    }

    @IsTest
    static void testGetTasks() {
        Test.startTest();
        List<Task__c> tasks = ProjectListController.getTasks();
        Test.stopTest();
        System.assertEquals(tasks.size(), 5);
    }

    @IsTest
    static void testGetSingleProject() {
        Project__c project = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Project__c
                WHERE Name = 'Project1'
        ];

        Test.startTest();

        Project__c testProject = ProjectListController.getSelectedProject(project.Id);

        Test.stopTest();

        System.assertEquals(testProject.DueDate__c, project.DueDate__c);
        System.assertEquals(testProject.Description__c, project.Description__c);
    }

    @IsTest
    static void testGetTasksByProjectId() {
        Project__c project = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Project__c
                WHERE Name = 'Project1'
        ];

        List<Task__c> tasks = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name,
                        Project__c,
                        Project__r.Name
                FROM Task__c
                LIMIT 3
        ];

        for (Task__c task2 : tasks) {
            task2.Project__c = project.Id;
        }
        update tasks;

        Test.startTest();

        List<Task__c> testTasks = ProjectListController.getTasksByProjectId(project.Id);

        Test.stopTest();

        System.assertEquals(testTasks[0].Project__c, project.Id);
        System.assertEquals(testTasks[1].Project__c, project.Id);
        System.assertEquals(testTasks[2].Project__c, project.Id);

    }

    @IsTest
    static void testCreateAndEditProject() {
        ProjectListController.ProjectWrapper projectWrapper = new ProjectListController.ProjectWrapper();
        projectWrapper.name = 'Test Insert';
        projectWrapper.status = 'new';
        projectWrapper.description = 'test insert wrapper';
        projectWrapper.dueDate = System.today();

        Test.startTest();

        ProjectListController.createProjectRecords(projectWrapper);

        Project__c insertedProject = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Project__c
                WHERE Name = 'Test Insert'
        ];



        projectWrapper.recordId = insertedProject.Id;
        projectWrapper.description = 'test update wrapper';
        ProjectListController.updateProjectRecords(insertedProject.Id, projectWrapper);

        Test.stopTest();

        Project__c updatedProject = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Project__c
                WHERE Name = 'Test Insert'
        ];

        System.assertEquals(insertedProject.Description__c, 'test insert wrapper');
        System.assertEquals(updatedProject.Description__c, 'test update wrapper');
    }

    @IsTest
    static void testDeleteProject() {
        Project__c project = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Project__c
                WHERE Name = 'Project1'
        ];

        Test.startTest();

        ProjectListController.deleteProjectRecord(project.Id);

        Test.stopTest();
    }

    @IsTest
    static void testDeleteTask() {
        Task__c task1 = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Task__c
                WHERE Name = 'Task1'
        ];

        Test.startTest();

        ProjectListController.deleteTask(task1.Id);

        Test.stopTest();
    }

    @IsTest
    static void testGetSelectedTask() {
        Task__c task1 = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Task__c
                WHERE Name = 'Task1'
        ];

        Task__c task2 = [
                SELECT
                        Id,
                        DueDate__c,
                        Description__c,
                        Status__c,
                        Name
                FROM Task__c
                WHERE Name = 'Task2'
        ];

        Test.startTest();

        Task__c selectedTask = ProjectListController.getSelectedTask(task1.Id);

        Test.stopTest();

        System.assertEquals(selectedTask.Id, task1.Id);
        System.assertNotEquals(selectedTask.Id, task2.Id);
    }

}