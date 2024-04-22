/**
 * Created by Denise.Baker on 4/16/24.
 */

@IsTest
private class UpdateProductAndTaskStatusBatchTest {
    @TestSetup
    static void testData() {
        List<Project__c> testProjects = new List<Project__c>();
        for (Integer i = 0; i < 5; i++) {
            Project__c testProject = new Project__c(
                    Name = 'Project' + i,
                    Description__c = 'Desc' + i,
                    DueDate__c = System.today() - i,
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
                    DueDate__c = System.today() - i,
                    Status__c = 'New',
                    Project__c = testProjects[i].Id
            );
            testTaskList.add(testTask);
        }
        insert testTaskList;
    }

    @IsTest
    static void testStatusUpdate() {
        List<Project__c>  projects = [
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
                WHERE Name LIKE '%Project%'
        ];

        Test.startTest();

        UpdateProjectAndTaskStatusBatch batch = new UpdateProjectAndTaskStatusBatch();
        Database.executeBatch(batch);

        Test.stopTest();

        List<Project__c>  updatedProjects = [
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

        List<Task__c> updatedTasks = updatedProjects[1].Tasks__r;

        System.assertEquals(updatedProjects[1].Status__c, 'Overdue');
        System.assertEquals(updatedTasks[0].Status__c, 'Overdue');
        System.assertNotEquals(updatedProjects[0].Status__c, 'Overdue');
    }
}