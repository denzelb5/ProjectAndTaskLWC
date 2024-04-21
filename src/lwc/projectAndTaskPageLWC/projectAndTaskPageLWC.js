/**
 * Created by Denise.Baker on 4/13/24.
 */

import {LightningElement, track, wire} from 'lwc';
import getProjects from '@salesforce/apex/ProjectListController.getProjects';
import {refreshApex} from "@salesforce/apex";

export default class ProjectAndTaskPageLwc extends LightningElement {
    @track projectListClosed = false;
    @track taskListClosed = false;
    @track listsOpen = false;
    @track singleProjectOpen = false;
    @track singleTaskOpen = false;
    @track newProjectModalOpen = false;
    @track newTaskModalOpen = false;
    refreshTable;

    @wire(getProjects)
    wiredProjects(result) {
        this.refreshTable = result;
    }

    handleViewLists(event) {
        console.log('is this firing ' + event.detail);
        this.listsOpen = event.detail;
        if (!this.listsOpen) {
            this.projectListClosed = true;
            this.taskListClosed = true;
        }
    }

    handleNewProjectModal(event) {
        this.newProjectModalOpen = event.detail;
        console.log('new proj event ' + event.detail);
        if (this.newProjectModalOpen) {
            // this.projectListClosed = true;
            this.taskListClosed = true;
        } else {
            this.projectListClosed = false;
            this.taskListClosed = false;
        }
        console.log('refresh table in parent ' + JSON.stringify(this.refreshTable));
        return refreshApex(this.refreshTable);
    }

    handleNewTaskModal(event) {
        this.newTaskModalOpen = event.detail;
        console.log('new task event ' + event.detail);
        if (this.newTaskModalOpen) {
            this.projectListClosed = true;
            // this.taskListClosed = true;
        } else {
            this.projectListClosed = false;
            this.taskListClosed = false;
        }
        console.log('refresh table in parent ' + JSON.stringify(this.refreshTable));
        return refreshApex(this.refreshTable);
    }


}