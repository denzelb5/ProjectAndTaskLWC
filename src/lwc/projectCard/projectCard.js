/**
 * Created by Denise.Baker on 4/13/24.
 */

import {api, LightningElement, track, wire} from 'lwc';
import getSelectedProject from '@salesforce/apex/ProjectListController.getSelectedProject';
import getTasksByProjectId from '@salesforce/apex/ProjectListController.getTasksByProjectId';
import {NavigationMixin} from "lightning/navigation";

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
        label: "View",
        type: "button-icon",
        initialWidth: 75,
        typeAttributes: {
            title: "View Details",
            alternativeText: "View Details",
            iconName: "action:info"
        }
    }
]

export default class ProjectCard extends NavigationMixin(LightningElement) {

    @track name;
    @track description;
    @track dueDate;
    @track status;
    @track project = {};
    @track tasks = [];
    @track error;
    @track projectId;
    @track cols = COLS;
    @track allTasks = [];
    @track filteredTasks = [];
    @track viewProjectList = false;
    @track viewSingleProject = true;
    @api recordId;



    // get single record for update
    @wire(getSelectedProject, { projectId: '$recordId' })
    wiredChosenProject({ data, error }) {
        if (data) {
            this.project = data;
            // this.projectInfo.recordId = this.project.Id;
            this.projectId = this.project.Id;
            this.error = undefined;


        } else if (error) {
            this.project = undefined;
            this.error = error;
        }
    }

    @wire(getTasksByProjectId, { projectId: '$recordId' })
    wiredTasksByProject({ data, error }) {
        if (data) {
            let name1;
            let dueDate;
            let description;
            let status;
            let project;

            this.tasks = data.map(row => {
                name1 = row.Name;
                dueDate = row.DueDate__c.toString();
                description = row.Description__c;
                status = row.Status__c;
                project = row.Project__r.Name;
                return {...row, name1, dueDate, description, status, project}
            })
            this.allTasks = this.tasks;
            this.filteredTasks = this.tasks;
            this.error = undefined;
        } else if (error) {
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
            this.data = this.tasks;

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
                this.filteredTasks = searchRecords;

            }
        } else {
            this.filteredTasks = this.allTasks;
        }
    }

    handleRowAction(event) {
        const row = event.detail.row;
        this.record = row;
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: row.Id,
                actionName: "view"
            }
        });
    }


}