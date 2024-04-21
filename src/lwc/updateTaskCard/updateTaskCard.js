/**
 * Created by Denise.Baker on 4/20/24.
 */

import { LightningElement,wire,track,api} from 'lwc';
import updateTasks from '@salesforce/apex/ProjectListController.updateTasks';
import getSelectedTask from '@salesforce/apex/ProjectListController.getSelectedTask';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import TASK_OBJECT from '@salesforce/schema/Task__c';
import NAME_FIELD from '@salesforce/schema/Task__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task__c.Description__c';
import DUE_DATE_FIELD from '@salesforce/schema/Task__c.DueDate__c';
import STATUS_FIELD from '@salesforce/schema/Task__c.Status__c';
import PROJECT_FIELD from '@salesforce/schema/Task__c.Project__c';

export default class UpdateTaskCard extends LightningElement {

    @track name;
    @track description;
    @track dueDate;
    @track status;
    @track project;
    @track task = {};
    @track error;
    @track taskId;
    @api recordId;
    @api editModalOpen;
    statusValues = [];



    @wire(getObjectInfo, { objectApiName: TASK_OBJECT }) taskInfo;
    @wire(getPicklistValues, {
        fieldApiName: STATUS_FIELD,
        recordTypeId: '012000000000000AAA' // No record types on this object.  This is the object info default Id
    })
    getPicklistValuesForStatus({ data, error }) {
        if (error) {
            console.error('Error fetching picklist values ' + error);
        } else if (data) {
            this.statusValues = [...data.values];
            // console.log('this.statusValues ' + JSON.stringify(this.statusValues));
        }
    }

    // get single record for update
    @wire(getSelectedTask, { taskId: '$recordId'})
    wiredChosenTask({ data, error }) {
        console.log('selected Task ' + JSON.stringify(data));
        if (data) {
            console.log('selected Task2 ' + JSON.stringify(data));
            this.task = data;
            this.taskInfo.recordId = this.task.Id;
            this.taskId = this.task.Id;
            this.error = undefined;
        } else if (error) {
            console.log('sel proj error ' + error);
            this.task = undefined;
            this.error = error;
        }
    }

    handleName(event) {
        this.taskInfo.name = event.target.value != null ? event.target.value : this.task.Name;
    }

    handleDescription(event) {
        this.taskInfo.description = event.target.value != null ? event.target.value : this.task.Description__c;
    }

    handleDueDate(event) {
        this.taskInfo.dueDate = event.target.value != null ? event.target.value : this.task.DueDate__c;
    }

    handleStatus(event) {
        this.taskInfo.status = event.target.value != null ? event.target.value : this.task.Status__c;
    }

    handleProject(event) {
        this.taskInfo.project = event.target.value != null ? event.target.value : this.task.Project__c;
    }

    handleSubmit(event) {
        console.log('event.target ' + event.target);
        updateTasks({ taskId: this.taskId,  taskInfo: this.taskInfo })
            .then((result) => {
                console.log('update result ' + JSON.stringify(result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: `${!this.task.Name} updated successfully!`,
                        variant: 'success'
                    })
                );
            });
        this.editModalOpen = false;
    }

}