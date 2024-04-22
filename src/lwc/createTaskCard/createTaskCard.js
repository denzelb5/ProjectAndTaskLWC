

import {LightningElement, wire, track, api} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import TASK_OBJECT from '@salesforce/schema/Task__c';
import STATUS_FIELD from '@salesforce/schema/Task__c.Status__c';
import PROJECT_FIELD from '@salesforce/schema/Task__c.Project__c';
import DUEDATE_FIELD from '@salesforce/schema/Task__c.DueDate__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Task__c.Description__c';
import NAME_FIELD from '@salesforce/schema/Task__c.Name';


export default class CreateTaskCard extends LightningElement {
    statusField = STATUS_FIELD;
    taskObject = TASK_OBJECT;
    projectField = PROJECT_FIELD;
    nameField = NAME_FIELD;
    dueDateField = DUEDATE_FIELD;
    descriptionField = DESCRIPTION_FIELD;

    @api objectApiName = this.taskObject;
    @api recordId;

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        this.newModalOpen = false;
        const closeModalEvent = new CustomEvent('closeModal', {
            detail: this.newModalOpen
        });
        this.dispatchEvent(closeModalEvent);
    }

    handleSuccess(event) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'New Task Created',
                message: 'New Task Successfully Created',
                variant: 'success'
            })
        )
    };

}
