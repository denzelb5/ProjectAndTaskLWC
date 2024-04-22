/**
 * Created by Denise.Baker on 4/21/24.
 */

import {api, LightningElement, track, wire} from 'lwc';
import getSelectedTask from '@salesforce/apex/ProjectListController.getSelectedTask';
import {NavigationMixin} from "lightning/navigation";

export default class TaskCard extends NavigationMixin(LightningElement) {
    @track projectName;
    @track task = {};
    @track error;
    @track taskId;
    @track viewTaskList = false;
    @track viewSingleTask = true;
    @track singleTaskOpen = false;
    @api recordId;



    // get single record for update
    @wire(getSelectedTask, { taskId: '$recordId' })
    wiredChosenProject({ data, error }) {
        if (data) {
            this.task = data;
            this.projectName = this.task.Project__r.Name;
            this.taskId = this.task.Id;
            this.error = undefined;


        } else if (error) {
            this.task = undefined;
            this.error = error;
        }
    }

}