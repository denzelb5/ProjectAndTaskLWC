/**
 * Created by Denise.Baker on 4/21/24.
 */

import {api, LightningElement, track, wire} from 'lwc';
import getSelectedTask from '@salesforce/apex/ProjectListController.getSelectedTask';
import {NavigationMixin} from "lightning/navigation";

export default class TaskCard extends NavigationMixin(LightningElement) {
    // @track name;
    // @track description;
    // @track dueDate;
    // @track status;
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
            console.log('selected task ' + JSON.stringify(data));
            this.task = data;
            this.projectName = this.task.Project__r.Name;
            this.taskId = this.task.Id;
            this.error = undefined;


        } else if (error) {
            console.log('sel task error ' + error);
            this.task = undefined;
            this.error = error;
        }
    }

    handlePrevious() {
        this.pageURL = 'https://brave-moose-h79f5u-dev-ed.trailblaze.lightning.force.com/lightning/n/Projects_Page';

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: this.pageURL,
            }
        });
    }

}