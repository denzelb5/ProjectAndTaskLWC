/**
 * Created by Denise.Baker on 4/18/24.
 */

import {LightningElement, wire, track, api} from 'lwc';
import createTasks from '@salesforce/apex/ProjectListController.createTask';
import {NavigationMixin} from "lightning/navigation";
import {getObjectInfo} from 'lightning/uiObjectInfoApi';
import {getPicklistValues} from 'lightning/uiObjectInfoApi';

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

// export default class CreateTaskCard extends NavigationMixin(LightningElement) {
//     @api newModalOpen;
//     @api projectId;
//     @track hideIcon = true;
//     @track wordWrap = false;
//
//     @wire(getObjectInfo, { objectApiName: TASK_OBJECT }) taskInfo;
//     @wire(getPicklistValues, {
//         fieldApiName: STATUS_FIELD,
//         recordTypeId: '012000000000000AAA' // No record types on this object.  This is the object info default ID
//     })
//     getPicklistValuesForStatus({ data, error }) {
//         if (error) {
//             console.error('Error fetching picklist values ' + error);
//         } else if (data) {
//             this.statusValues = [...data.values];
//             console.log('this.statusValues ' + JSON.stringify(this.statusValues));
//         }
//     }
//
//     handleName(event) {
//         this.taskInfo.name = event.target.value;
//     }
//
//     handleDescription(event) {
//         this.taskInfo.description = event.target.value;
//     }
//
//     handleDueDate(event) {
//         this.taskInfo.dueDate = event.target.value;
//     }
//
//     handleStatus(event) {
//         this.taskInfo.status = event.target.value;
//     }
//
//     handleProject(event) {
//         console.log(event)
//         this.taskInfo.project = event.target.value;
//     }
//
//     handleSelection(event) {
//         // let lineItemId = event.target.item;
//         let relatedId = event.detail.split('$')[0];
//         console.log('relatedId ' + relatedId);
//         console.log('event targ name ' + event.target.name);
//         let index = event.target.id.split('-')[0];
//         switch (event.target.name) {
//             case 'project':
//                 // this.filteredTasks[index].Project__c = relatedId;
//                 this.projectId = relatedId;
//                 this.taskInfo.project = relatedId;
//                 break;
//
//             default:
//                 this.toast('OBJECT TYPE NOT FOUND', 'Invalid Object Type: ' + event.target.name + '.\nExpected \'Project\' ', 'error');
//         }
//     }
//
//
//
//     handleSuccess(event) {
//         createTasks({taskInfo: this.taskInfo})
//             .then((result) => {
//                 this.newModalOpen = false;
//                 this.dispatchEvent(
//                     // new ShowToastEvent({
//                     //     title: 'Success',
//                     //     message: 'Task created successfully!',
//                     //     variant: 'success'
//                     // }),
//                     new CustomEvent('closeModal', {
//                         detail: this.newModalOpen
//                     })
//                 );
//             });
//
//     }
// }