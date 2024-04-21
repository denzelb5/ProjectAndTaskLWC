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
    static void descriptiveTestName() {
        String myObject = 'Account';
        String searchTerm = 'Name';
        String filter = 'Name != null';
        System.assertEquals(0, ProjectListController.search(myObject, searchTerm, filter).size());
        insert new Account(Name = searchTerm);
        System.assertEquals(1, ProjectListController.search(myObject, searchTerm, filter).size());
    }

}