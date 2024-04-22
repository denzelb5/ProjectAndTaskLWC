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


    handleNewProjectModal(event) {
        this.newProjectModalOpen = event.detail;
        if (this.newProjectModalOpen) {
            // this.projectListClosed = true;
            this.taskListClosed = true;
        } else {
            this.projectListClosed = false;
            this.taskListClosed = false;
        }

        return refreshApex(this.refreshTable);
    }

    handleNewTaskModal(event) {
        this.newTaskModalOpen = event.detail;
        if (this.newTaskModalOpen) {
            this.projectListClosed = true;
            // this.taskListClosed = true;
        } else {
            this.projectListClosed = false;
            this.taskListClosed = false;
        }
        return refreshApex(this.refreshTable);
    }


}