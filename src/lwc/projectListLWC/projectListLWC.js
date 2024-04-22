/**
 * Created by Denise.Baker on 4/13/24.
 */

import { LightningElement, wire, track, api } from 'lwc';
import getProjects from '@salesforce/apex/ProjectListController.getProjects';
import deleteProjectRecord from '@salesforce/apex/ProjectListController.deleteProjectRecord';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' }

];

const COLS = [
    {
        label: "Name",
        fieldName: "name1",
        type: "text",
        typeAttributes: {label: { fieldName: 'Name' },
            target: '_self'},
        sortable: true
    },
    {
        label: "Description",
        fieldName: "description",
        type: "text",
        typeAttributes: {label: { fieldName: 'Description__c' },
            target: '_blank'},
        sortable: true
    },
    {
        label: "Due Date",
        fieldName: "dueDate",
        type: "text",
        typeAttributes:  {label: { fieldName: 'DueDate__c' },
            target: '_blank'
        },
        sortable: true
    },
    {
        label: "Status",
        fieldName: "status",
        type: "text",
        typeAttributes: {label: { fieldName: 'Status__c' },
            target: '_blank'},
        sortable: true
    },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }
    // {
    //     label: "View",
    //     type: "button-icon",
    //     initialWidth: 75,
    //     typeAttributes: {
    //         title: "View Details",
    //         alternativeText: "View Details",
    //         iconName: "action:info"
    //     }
    // }
]

export default class ProjectListLwc extends LightningElement {
    @track projects = [];
    @track error;
    @track cols = COLS;
    @track showLoadingSpinner = false;
    @track allProjects = [];
    @track filteredProjects = [];
    @api projectListClosed = false;
    @track viewSingleProject = false;
    @track viewTaskList;
    @track projectId;
    @track isModalOpen = false;
    @track isLoaded=false;
    @track projectInfo = {};
    @track editModalOpen = false;
    @api refreshTable;

    @wire(getProjects)
    wiredProjects(result) {
        this.refreshTable = result;
        this.viewTaskList = true;
        const { data, error } = result;
        if (data) {
            this.projectListClosed = false;
            let name1;
            let dueDate;
            let description;
            let status;
            this.projects = data.map(row => {
                name1 = row.Name;
                dueDate = row.DueDate__c;
                description = row.Description__c;
                status = row.Status__c;
                return {...row, name1, dueDate, description, status}
            })
            this.allProjects = this.projects;
            this.filteredProjects = this.projects;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.projects = undefined;
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.filteredProjects));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // checking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.filteredProjects = parseData;
    }

    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
        if (searchKey) {
            this.data = this.projects;

            if (this.data) {
                let searchRecords = [];

                for (let record of this.data) {
                    let valuesArray = Object.values(record);

                    for (let val of valuesArray) {
                        let strVal = String(val);

                        if (strVal) {

                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
                this.filteredProjects = searchRecords;
            }
        } else {
            this.filteredProjects = this.allProjects;
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                if (row.Tasks__r === undefined) {
                    this.handleDeleteRow(row);
                } else {
                    this.handleCannotDelete();
                }
                break;
            case 'edit':
                console.log('edit row ' + JSON.stringify(row));
                this.handleEditRow(row);
                break;
            case 'show_details':
                this.showRecordDetails(row);
                break;
            default:
        }

    }

    handleEditRow(row) {
        this.projectListClosed = true;
        this.viewTaskList = false;
        this.editModalOpen = true;
        this.projectId = row.Id != null ? row.Id : null;
        const openNewProjectEvent = new CustomEvent('opennewmodal', {
            detail: this.editModalOpen
        })
        this.dispatchEvent(openNewProjectEvent);
    }

    handleCannotDelete() {
        const noDeleteEvent = new ShowToastEvent({
            title: 'Delete Unsuccessful',
            message: 'Projects with tasks associated cannot be deleted without deleting the associated tasks first.',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(noDeleteEvent);
    }

    handleDeleteRow(row) {
        deleteProjectRecord({ project: row })
            .then(result => {
                const evt = new ShowToastEvent({
                    title: 'Success Message',
                    message: 'Record deleted successfully ',
                    variant: 'success',
                    mode: 'dismissible'
                });
                this.dispatchEvent(evt);
                return refreshApex(this.refreshTable);

            } )
            .catch(error => {
                this.error = error;
            });

    }

    showRecordDetails(row) {
        this.projectListClosed = true;
        this.viewSingleProject = true;
        this.projectId = row.Id != null ? row.Id : null;
        const openNewProjectEvent = new CustomEvent('opennewmodal', {
            detail: this.viewSingleProject
        })
        this.dispatchEvent(openNewProjectEvent);
    }


    handleNewModal() {
        this.isModalOpen = true;
        this.projectListClosed = true;
        const openNewProjectEvent = new CustomEvent('opennewmodal', {
            detail: this.isModalOpen
        })
        this.dispatchEvent(openNewProjectEvent);
    }

    closeNewModal(){
        this.isModalOpen = false;
        this.projectListClosed = false;
        const closeNewProjectEvent = new CustomEvent('closenewmodal', {
            detail: this.isModalOpen
        })
        this.dispatchEvent(closeNewProjectEvent);
        return refreshApex(this.refreshTable);
    }

    closeDetailModal() {
        this.viewSingleProject = false;
        this.projectListClosed = false;
        const closeProjectDetailEvent = new CustomEvent('closedetailmodal', {
            detail: this.viewSingleProject
        })
        this.dispatchEvent(closeProjectDetailEvent);
    }

    closeEditModal() {
        this.editModalOpen = false;
        this.projectListClosed = false;
        this.viewTaskList = true;
        const closeNewProjectEvent = new CustomEvent('closenewmodal', {
            detail: this.editModalOpen
        })
        this.dispatchEvent(closeNewProjectEvent);
        return refreshApex(this.refreshTable);

    }

}