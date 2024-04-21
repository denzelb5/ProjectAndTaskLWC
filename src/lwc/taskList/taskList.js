/**
 * Created by Denise.Baker on 4/13/24.
 */

import {LightningElement, wire, track, api} from 'lwc';
import getTasks from '@salesforce/apex/ProjectListController.getTasks';
import {NavigationMixin} from "lightning/navigation";
import {ShowToastEvent} from "lightning/platformShowToastEvent";
import deleteTask from '@salesforce/apex/ProjectListController.deleteTask';
import {refreshApex} from "@salesforce/apex";

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
        label: "Project",
        fieldName: "project",
        type: "text",
        typeAttributes: {label: { fieldName: 'Project__r.Name' },
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

export default class TaskList extends NavigationMixin(LightningElement) {
    @track tasks = [];
    @track allTasks = [];
    @track filteredTasks = [];
    @track error;
    @track cols = COLS;
    @track taskInfo = {};
    @track editModalOpen = false;
    @track newModalOpen = false;
    @track viewProjectList;
    @track viewSingleTask = false;
    @api taskListClosed;
    @track taskId;
    refreshTable;


    @wire(getTasks)
    wiredTasks(result) {
        this.refreshTable = result;
        const { data, error } = result;
        if (data) {
            let name1;
            let dueDate;
            let description;
            let status;
            let project;

            this.tasks = data.map(row => {
                // console.log('task row ' + JSON.stringify(row));
                name1 = row.Name;
                // dueDate = row.DueDate__c.toString();
                dueDate = row.DueDate__c;
                description = row.Description__c;
                status = row.Status__c;
                project = row.Project__r.Name;
                return {...row, name1, dueDate, description, status, project}
            })
            this.allTasks = this.tasks;
            this.filteredTasks = this.tasks;
            this.error = undefined;
        } else if (error) {
            console.log('task error ' + error);
            this.error = error;
            this.tasks = undefined;
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.filteredTasks));

        // Return the value stored in the field
        let keyValue = (a) => {
            console.log('a[fieldname]' + a[fieldname]);
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
        this.filteredTasks = parseData;
    }

    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();
        if (searchKey) {
            console.log('searchKey ' + searchKey);
            this.data = this.tasks;
            console.log('this.data ' + JSON.stringify(this.data));
            if (this.data) {
                console.log('this.data2 ' + JSON.stringify(this.data));
                let searchRecords = [];

                for (let record of this.data) {
                    let valuesArray = Object.values(record);

                    for (let val of valuesArray) {
                        console.log('val is ' + val);
                        let strVal = String(val);

                        if (strVal) {

                            if (strVal.toLowerCase().includes(searchKey)) {
                                searchRecords.push(record);
                                break;
                            }
                        }
                    }
                }
                this.filteredTasks = searchRecords;
                console.log('Matched tasks are ' + JSON.stringify(searchRecords));

            }
        } else {
            this.filteredTasks = this.allTasks;
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                console.log('delete row Id ' + row.Id);
                this.handleDeleteRow(row.Id);
                break;
            case 'edit':
                this.handleEditRow(row);
                break;
            case 'show_details':
                this.showRecordDetails(row);
                break;
            default:
        }

    }
    handleDeleteRow(recordIdToDelete) {
        deleteTask({ taskId: recordIdToDelete })
            .then(result => {
                console.log('this.tasks ' + JSON.stringify(this.tasks));

                const evt = new ShowToastEvent({
                    title: 'Success Message',
                    message: 'Record deleted successfully ',
                    variant: 'success',
                    mode:'dismissible'
                });
                this.dispatchEvent(evt);
                return refreshApex(this.refreshTable);

            } )
            .catch(error => {
                this.error = error;
            });

    }

    showRecordDetails(row) {
        this.viewProjectList = false;
        this.viewSingleTask = true;
        this.taskListClosed = true;
        this.taskId = row.Id != null ? row.Id : null;
        const openNewTaskEvent = new CustomEvent('opennewmodal', {
            detail: this.viewSingleTask
        })
        this.dispatchEvent(openNewTaskEvent);
    }

    handleEditRow(row) {
        this.taskListClosed = true;
        this.editModalOpen = true;
        this.taskId = row.Id != null ? row.Id : null;
        const openNewProjectEvent = new CustomEvent('opennewmodal', {
            detail: this.editModalOpen
        })
        this.dispatchEvent(openNewProjectEvent);
    }

    handleNewModal() {
        this.newModalOpen = true;
        // this.viewProjectList = false;
        this.taskListClosed = true;
        const openNewProjectEvent = new CustomEvent('opennewmodal', {
            detail: this.newModalOpen
        })
        this.dispatchEvent(openNewProjectEvent);
    }

    closeNewModal(){
        this.newModalOpen = false;
        // this.viewProjectList = true;
        this.taskListClosed = false;
        const closeNewTaskEvent = new CustomEvent('closenewmodal', {
            detail: this.newModalOpen
        })
        this.dispatchEvent(closeNewTaskEvent);
        return refreshApex(this.refreshTable);

    }

    handleCloseTaskModal(event) {
        this.viewProjectList = event.detail;
        this.taskListClosed = event.detail;
    }

    closeDetailModal() {
        this.viewSingleTask = false;
        this.taskListClosed = false;
        const closeProjectDetailEvent = new CustomEvent('closedetailmodal', {
            detail: this.viewSingleTask
        })
        this.dispatchEvent(closeProjectDetailEvent);
    }

}