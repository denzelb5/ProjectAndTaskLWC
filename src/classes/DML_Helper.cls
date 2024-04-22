

//
// v12_DMLHelper
// Created by:  Denise Baker
// 04/13/2024
// Purpose:  Generic class for standardizing DML operations to SObjects.
//  This should probably be called by an SOBject-specific helper class
//  that prepares the list for updating/inserting according to the rules
//  of that object.

public with sharing class DML_Helper {
    public static List<AuditLog__c> auditLogsToInsert = new List<AuditLog__c>();

    // insertObjects
    // Takes 2 args:
    //      List<SObject> objectsToInsert -- these are the objects to insert
    //      Boolean allOrNone -- this is used for the Database.insert method.
    // If anything fails, we catch the exception and write it to the exception logs:
    public static void insertSObjects(List<SObject> objectsToInsert, Boolean allOrNone) {

        try {
            List<Database.SaveResult> srList = Database.insert(objectsToInsert, allOrNone);
            for (Database.SaveResult sr : srList) {
                if (sr.isSuccess()) {
                    String recordId = sr.getId();
                    String objectName = objectsToInsert[0].getSObjectType().getDescribe().getName();
                    AuditLog__c log = assignToAuditLog('Insert', objectName, recordId);
                    auditLogsToInsert.add(log);
                }
            }
        } catch (Exception ex) {
            System.debug('Exception DML Helper ' + ex.getMessage() + '' + ex.getLineNumber());
        }
        insertAuditLogs(auditLogsToInsert);
    }



    // updateObjects
    // Takes 2 args:
    //      List<SObject> objectsToUpdate -- these are the objects to update
    //      Boolean allOrNone -- this is used for the Database.update method.
    // If anything fails, we catch the exception and write it to the exception logs:
    public static void updateSObjects(List<SObject> objectsToUpdate, Boolean allOrNone) {
        try {
            Database.SaveResult[] srList = Database.update(objectsToUpdate, allOrNone);
            for (Database.SaveResult sr : srList) {
                if (sr.isSuccess()) {
                    String recordId = sr.getId();
                    String objectName = objectsToUpdate[0].getSObjectType().getDescribe().getName();
                    AuditLog__c log = assignToAuditLog('Upsert', objectName, recordId);
                    auditLogsToInsert.add(log);
                }
            }
        } catch (Exception ex) {
            System.debug('Exception DML Helper ' + ex.getMessage() + '' + ex.getLineNumber());
        }
        insertAuditLogs(auditLogsToInsert);
    }

    //upsertObjects
    //Takes 2 args:
    //List<SObject>objectsToUpsert--these are the objects to upsert
    //Boolean allOrNone--this is used for the Database.upsert method.
    //If anything fails, we catch the exception and write it to the exception logs:
    public static void upsertSObjects(List<SObject>objectsToUpsert, Boolean allOrNone) {
        try {
            List<Database.UpsertResult>  urList = Database.upsert(objectsToUpsert, allOrNone);
            for (Database.UpsertResult ur : urList) {
                if (ur.isSuccess()) {
                    String recordId = ur.getId();
                    String objectName = objectsToUpsert[0].getSObjectType().getDescribe().getName();
                    AuditLog__c log = assignToAuditLog('Upsert', objectName, recordId);
                    auditLogsToInsert.add(log);
                }
            }
        } catch (Exception ex) {
            System.debug('Exception:' + ex.getMessage() + '' + ex.getLineNumber());
        }
        insertAuditLogs(auditLogsToInsert);
    }

    //deleteObjects
    //Takes 2 args:
    //List<SObject>objectsToDelete--these are the objects to upsert
    //Boolean allOrNone--this is used for the Database.delete method.
    //If anything fails, we catch the exception and write it to the exception logs:
    public static void deleteSObjects(List<SObject>objectsToDelete, Boolean allOrNone) {
        try {
            List<Database.DeleteResult>  deleteList = Database.delete(objectsToDelete, allOrNone);

            for (Database.DeleteResult result : deleteList) {
                if (result.isSuccess()) {
                    String recordId = result.getId();
                    String objectName = objectsToDelete[0].getSObjectType().getDescribe().getName();
                    AuditLog__c log = assignToAuditLog('Delete', objectName, recordId);
                    auditLogsToInsert.add(log);
                }
            }
        } catch (Exception ex) {
            System.debug('Exception:' + ex.getMessage() + '' + ex.getLineNumber());

        }
        insertAuditLogs(auditLogsToInsert);
    }

    // Helper method to create Audit Log records when a DML operation is performed
    private static AuditLog__c assignToAuditLog(String action, String objectName, String recordId) {
        AuditLog__c log = new AuditLog__c();
        log.Action__c = action;
        log.Date__c = Datetime.now();
        log.RecordId__c = recordId;
        log.Object__c = objectName;
        log.Name = action + '--' + objectName + '--' + Datetime.now();

        return log;
    }

    // Helper method to insert audit logs
    private static void insertAuditLogs(List<AuditLog__c> logsToInsert) {
        if (logsToInsert.size() > 0) {
            try {
                List<Database.SaveResult> srList = Database.insert(logsToInsert, false);
            } catch(Exception e) {
                System.debug('Audit Log Insert Exception: ' + e.getMessage() + '' + e.getLineNumber());
            }
        }
    }

}