/**
 * Created by Denise.Baker on 4/14/24.
 */

import { LightningElement,wire,track,api} from 'lwc';
import updateProjectRecords from '@salesforce/apex/ProjectListController.updateProjectRecords';
import getSelectedProject from '@salesforce/apex/ProjectListController.getSelectedProject';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import PROJECT_OBJECT from '@salesforce/schema/Project__c';
import NAME_FIELD from '@salesforce/schema/Project__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Project__c.Description__c';
import DUE_DATE_FIELD from '@salesforce/schema/Project__c.DueDate__c';
import STATUS_FIELD from '@salesforce/schema/Project__c.Status__c';

export default class UpdateProjectCard extends LightningElement {

    @track name;
    @track description;
    @track dueDate;
    @track status;
    @track project = {};
    @track error;
    @track projectId;
    @api recordId;
    @api editModalOpen;
    statusValues = [];



    @wire(getObjectInfo, { objectApiName: PROJECT_OBJECT }) projectInfo;
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
   @wire(getSelectedProject, { projectId: '$recordId'})
    wiredChosenProject({ data, error }) {
       console.log('selected Proj ' + JSON.stringify(data));
        if (data) {
            console.log('selected Proj ' + JSON.stringify(data));
            this.project = data;
            this.projectInfo.recordId = this.project.Id;
            this.projectId = this.project.Id;
            this.error = undefined;
        } else if (error) {
            console.log('sel proj error ' + error);
            this.project = undefined;
            this.error = error;
        }
    }

    handleName(event) {
        this.projectInfo.name = event.target.value != null ? event.target.value : this.project.Name;
    }

    handleDescription(event) {
        this.projectInfo.description = event.target.value != null ? event.target.value : this.project.Description__c;
    }

    handleDueDate(event) {
        this.projectInfo.dueDate = event.target.value != null ? event.target.value : this.project.DueDate__c;
    }

    handleStatus(event) {
        this.projectInfo.status = event.target.value != null ? event.target.value : this.project.Status__c;
    }

    handleSubmit(event) {
        console.log('event.target ' + event.target);
        updateProjectRecords({ projectId: this.projectId,  projectInfo: this.projectInfo })
            .then((result) => {
                console.log('update result ' + JSON.stringify(result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Project updated successfully!',
                        variant: 'success'
                    })
                );
            });
        this.editModalOpen = false;
    }

}