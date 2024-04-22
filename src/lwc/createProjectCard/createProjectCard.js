/**
 * Created by Denise.Baker on 4/13/24.
 */

import { LightningElement,wire,track,api} from 'lwc';
import createProjectRecords from '@salesforce/apex/ProjectListController.createProjectRecords';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import PROJECT_OBJECT from '@salesforce/schema/Project__c';
import STATUS_FIELD from '@salesforce/schema/Project__c.Status__c';


export default class CreateProjectCard extends LightningElement {
    @track name;
    @track description;
    @track dueDate;
    @track status;
    @track project = {};
    @track error;
    statusValues = [];
    @api isModalOpen;



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
        }
    }

    handleName(event) {
        this.projectInfo.Name = event.target.value;
    }

    handleDescription(event) {
        this.projectInfo.description = event.target.value;
    }

    handleDueDate(event) {
        this.projectInfo.dueDate = event.target.value;
    }

    handleStatus(event) {
        this.projectInfo.status = event.target.value;
    }

    handleSuccess(event) {
        createProjectRecords({projectInfo: this.projectInfo})
            .then((result) => {
                this.isModalOpen = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Project created successfully!',
                        variant: 'success'
                    })
                );
            });
        const closedModalEvent = new CustomEvent('closenewproj', {
            detail: this.isModalOpen
        });
        this.dispatchEvent(closedModalEvent);
    }


}