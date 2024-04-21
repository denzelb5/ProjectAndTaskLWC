/**
 * Created by Denise.Baker on 4/18/24.
 */

import {api, LightningElement, track, wire} from 'lwc';
import lookUp from '@salesforce/apex/ProjectListController.search';

export default class customLookUp extends LightningElement {

    @api objName;
    @api item;
    @api iconName;
    @api filter = '';
    @api searchPlaceholder = 'Search';
    @api hideIcon = false;
    @api wordWrap = false;
    @track selectedName;
    @track href;
    @track records;
    @track isValueSelected;
    @track blurTimeout;
    @track searchTerm;

    //CSS
    @track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    @track inputClass = '';
    @track displayStyle = 'slds-truncate';

    @wire(lookUp, {
        myObject: '$objName',
        searchTerm: '$searchTerm',
        filter: '$filter'
    })
    wiredRecords({data, error}) {
        if (data) {
            this.records = data;
            this.error = undefined;
        } else if (error) {
            this.records = undefined;
            this.error = error;
        }
    }

    connectedCallback() {
        this.displayStyle = (this.wordWrap === true ? 'word-wrap' : 'slds-truncate');
    }

    handleClick() {
        this.searchTerm = '';
        this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
    }

    onBlur() {
        this.blurTimeout = setTimeout(() => {
            this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'
        }, 300);
    }

    onSelect(event) {
        let selectedName = event.currentTarget.dataset.name;
        let selectedId = event.currentTarget.dataset.id + '$' + selectedName;
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail: selectedId, label: selectedName});
        this.dispatchEvent(valueSelectedEvent);
        this.isValueSelected = true;
        this.selectedName = selectedName;
        // this.href = '/' + selectedId; // TO DO: FIGURE OUT HOW TO OPEN IN NEW TAB... ('_blank')
        if (this.blurTimeout) {
            clearTimeout(this.blurTimeout);
        }
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
    }

    handleRemovePill() {
        this.isValueSelected = false;
        const valueSelectedEvent = new CustomEvent('lookupselected', {detail: ''});
        this.dispatchEvent(valueSelectedEvent);
    }

    onChange(event) {
        this.searchTerm = event.target.value;
    }

}