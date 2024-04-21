/**
 * Created by Denise.Baker on 4/13/24.
 */

@IsTest
public with sharing class DML_HelperTest {

    @IsTest
    public static void testInsert() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas'));
        DML_Helper.insertSObjects(conList, false);
        Test.stopTest();
        System.assertEquals(2,[SELECT COUNT() FROM Contact]);
    }

    @IsTest
    public static void testInsertFail1() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(
                FirstName='Benny',
                LastName='Hannas',
                Citizenship__c = 'this is way too long to fit in that field')
        );
        DML_Helper.insertSObjects(conList, false);
        Test.stopTest();
        System.assertEquals(1,[SELECT COUNT() FROM Contact]);
    }

    @IsTest
    public static void testInsertFail2() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas', Citizenship__c = 'this is way too long to fit in that field'));
        DML_Helper.insertSObjects(conList, true);
        Test.stopTest();
        System.assertEquals(0,[SELECT COUNT() FROM Contact]);
    }

    @IsTest
    public static void testUpdate() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        List<Account> acctList = new List<Account>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas'));
        acctList.add(new Account(Name = 'Acme'));
        acctList.add(new Account(Name = 'Acme1'));
        DML_Helper.insertSObjects(conList, false);
        DML_Helper.upsertSObjects(acctList, false);
        conList[0].LastName = 'Smith';
        DML_Helper.updateSObjects(conList, false);
        Test.stopTest();
        System.assertEquals(1,[SELECT COUNT() FROM Contact WHERE LastName = 'Smith']);
        System.assertEquals(1,[SELECT COUNT() FROM Account WHERE Name = 'Acme']);
    }

    @IsTest
    public static void testUpdateFail1() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas'));
        DML_Helper.insertSObjects(conList, false);
        conList[0].LastName = 'Smith';
        conList[1].Citizenship__c = 'this is way too long to fit in that field';
        conList[1].LastName = 'Smith';
        DML_Helper.updateSObjects(conList, false);
        conList[1].Citizenship__c = 'this is even way longer to fit into that field';
        DML_Helper.upsertSObjects(conList, false);
        Test.stopTest();
        System.assertEquals(1,[SELECT COUNT() FROM Contact WHERE LastName = 'Smith']);
    }

    @IsTest
    public static void testUpdateFail2() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas'));
        DML_Helper.insertSObjects(conList, false);
        conList[0].LastName = 'Smith';
        conList[1].Citizenship__c = 'this is way too long to fit in that field';
        conList[1].LastName = 'Smith';
        DML_Helper.updateSObjects(conList, true);
        conList[1].Citizenship__c = 'this is even way longer to fit into that field';
        DML_Helper.upsertSObjects(conList, true);
        Test.stopTest();
        System.assertEquals(0,[SELECT COUNT() FROM Contact WHERE LastName = 'Smith']);
    }

    @IsTest
    public static void testDelete() {
        Test.startTest();
        List<Contact> conList = new List<Contact>();
        conList.add(new Contact(FirstName='Kevin', LastName='Faberges'));
        conList.add(new Contact(FirstName='Benny', LastName='Hannas'));
        DML_Helper.insertSObjects(conList, false);
        DML_Helper.deleteSObjects(conList, false);
        List<Contact> contactsExistCheck = [
                SELECT
                        Id
                FROM Contact
                WHERE FirstName = 'KEVIN'
                AND LastName = 'Faberges'
        ];
        Test.stopTest();
        System.assertEquals(contactsExistCheck.size(), 0);

    }

    @IsTest
    public static void testAuditLogCreation() {
        List<Project__c> projectsToInsert = new List<Project__c>();
        List<Task__c> tasks2Insert = new List<Task__c>();

        for (Integer i = 0; i < 5; i++) {
            Project__c project = new Project__c(
                    Name = 'Audit' + i,
                    DueDate__c = Date.today(),
                    Status__c = 'New',
                    Description__c = 'Audit' + i
            );
            projectsToInsert.add(project);
        }

        Test.startTest();
        DML_Helper.insertSObjects(projectsToInsert, true);


        Set<Id> projIds = new Set<Id>();
        for (Project__c proj : projectsToInsert) {
            projIds.add(proj.Id);
        }

        List<AuditLog__c> projectLogs = [SELECT Id, Object__c, Action__c, RecordId__c, Date__c FROM AuditLog__c WHERE RecordId__c IN :projIds];
        System.debug('projectLogs ' + projectLogs);

        System.assertEquals(projectLogs[0].Object__c, 'Project__c');
        System.assertEquals(projectLogs[0].RecordId__c, projectsToInsert[0].Id);

        for (Integer i = 0; i < 5; i++) {
            Task__c testTask = new Task__c(
                    Name = 'Task' + i,
                    Description__c = 'Desc' + i,
                    DueDate__c = System.today().addDays(i),
                    Status__c = 'New',
                    Project__c = projectsToInsert[i].Id
            );
            tasks2Insert.add(testTask);
        }


        DML_Helper.insertSObjects(tasks2Insert, false);
        Test.stopTest();

        Set<Id> taskIds = new Set<Id>();
        for (Task__c task1 : tasks2Insert) {
            taskIds.add(task1.Id);
        }

        //Query created audit logs from task list insert
        List<AuditLog__c> taskLogs = [SELECT Id, Object__c, Action__c, RecordId__c, Date__c FROM AuditLog__c WHERE RecordId__c IN :taskIds];

        System.assertEquals(taskLogs[0].Object__c, 'Task__c');
        System.assertEquals(taskLogs[0].RecordId__c, tasks2Insert[0].Id);

    }

}