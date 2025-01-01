import {LightningElement, wire} from 'lwc';
import {refreshApex} from '@salesforce/apex';
import getAvailableCrew from '@salesforce/apex/CrewSchedulerController.getAvailableCrew';
import getCrews from '@salesforce/apex/CrewSchedulerController.getCrews';
import getAssignments from '@salesforce/apex/CrewSchedulerController.getAssignments';
import assignCrewToFlight from '@salesforce/apex/CrewSchedulerController.assignCrewToFlight';
import removeCrewFromFlight from '@salesforce/apex/CrewSchedulerController.removeCrewFromFlight';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {NavigationMixin} from 'lightning/navigation';

export default class CrewScheduler extends NavigationMixin(LightningElement) {
    availableCrew = [];
    crews = [];
    assignments = [];
    currentDate = new Date();
    timeSlots = [];
    error;
    flight;
    
    // Properties to store wire adapter results
    wiredAvailableCrewResult;
    wiredCrewResult;
    wiredAssignmentsResult;

    // Wire the crew data
    @wire(getAvailableCrew)
    wiredAvailableCrew(result) {
        this.wiredAvailableCrewResult = result;
        const { data, error } = result;
        if (data) {
            this.availableCrew = [...data];  // Create a new array reference
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.availableCrew = [];
            console.log('Error:', error.body.message);
            this.handleError(error.body.message);
        }
    }

    // Wire the crew data
    @wire(getCrews)
    wiredCrew(result) {
        this.wiredCrewResult = result;
        const { data, error } = result;
        if (data) {
            this.crews = [...data];  // Create a new array reference
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.crews = [];
            console.log('Error:', error.body.message);
            this.handleError(error.body.message);
        }
    }

    // Show info toast message
    handleInfo(message) {
        this.dispatchEvent(new ShowToastEvent({title: 'Info', message: message, variant: 'info'}));
    }

    // Show success toast message
    handleSuccess(message) {
        this.dispatchEvent(new ShowToastEvent({title: 'Success', message: message, variant: 'success'}));
    }

    // Show error toast message
    handleError(error) {
        this.dispatchEvent(new ShowToastEvent({title: 'Error', message: error.message, variant: 'error'}));
    }

    // Wire the assignments data
    @wire(getAssignments, {dateTimeVar: '$currentDate'})
    wiredAssignments(result) {
        this.wiredAssignmentsResult = result;
        const { data, error } = result;
        this.generateTimeSlots();

        if (data) {
            this.assignments = [...data].map(assignment => {
                const departureDate = new Date(assignment.Departure__c);
                const arrivalDate = new Date(assignment.Arrival__c);
                const formattedDepartureTime = departureDate.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });
                const formattedArrivalTime = arrivalDate.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                // Each hour has 1 slot which is 100px wide
                // calculate total of formattedDepartureTime and formattedArrivalTime
                // to get the width of the div

                // departure date
                const hours = departureDate.getHours();
                const minutes = departureDate.getMinutes();

                // Calculate total hours from midnight
                const totalHoursFromMidnight = hours + (minutes / 60);
                // Convert minutes to a fraction of an hour

                // Calculate total hours
                const totalHours = (arrivalDate - departureDate) / (1000 * 60 * 60); // Total hours
                const totalWidth = totalHours * 100; // 100px for every hour
                const widthStyle = `max-width: ${totalWidth}px;`;
                const marginLeft = `margin-left: ${
                    totalHoursFromMidnight * 100
                }px;`;
                const flightInfoStyle = widthStyle + marginLeft;
                const crew = assignment.Crew__r ? this.crews.find(c => c.Id === assignment.Crew__r.Id) : null;
                return {
                    ...assignment,
                    formattedDepartureTime,
                    formattedArrivalTime,
                    flightInfoStyle,
                    crew
                };
            });
            this.error = undefined;

        } else if (error) {
            this.error = error;
            this.assignments = [];
            console.log('Error:', error.body.message);
            this.handleError(error.body.message);
        }
    }

    // Generate time slots for the schedule grid
    generateTimeSlots() {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            const hour = i % 12 === 0 ? 12 : i % 12;
            const period = i < 12 ? 'AM' : 'PM';
            slots.push(`${hour}:00 ${period}`);
        }
        this.timeSlots = slots;
    }

    // Handle crew assignment
    async handleDrop(event) {
        event.preventDefault();
        const crewId = JSON.parse(event.dataTransfer.getData('text/plain')).crewId;
        console.log('Crew ID:', crewId);
        console.log('Drop target:', event.target.dataset.id);
        // returns null
        const timeSlot = event.target.dataset.timeSlot;

        // Calculate departure and arrival times based on the time slot
        const departureTime = new Date(this.currentDate);
        departureTime.setHours(parseInt(timeSlot), 0, 0, 0);
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(departureTime.getHours() + 2); // Default 2-hour flight duration
        let response;
        try {
            response = await assignCrewToFlight({crewId: crewId, crewAssignmentId: event.target.dataset.id});
            this.refreshData();
            // Update the crew member's availability status
            this.handleSuccess('Crew member assigned successfully');
        } catch (error) {
            if (response != null) {
                this.handleError(error);
            }
        }
    }

    // Handle date navigation
    handlePrevious() {
        this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() - 1));
        refreshApex(this.wiredAssignments);
    }

    handleNext() {
        this.currentDate = new Date(this.currentDate.setDate(this.currentDate.getDate() + 1));
        refreshApex(this.wiredAssignments);
    }

    // Format current date for display
    get currentDateDisplay() {
        return this.currentDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    // Drag and Drop Handlers
    handleDragStart(event) {
        console.log('Starting drag: ', event.target.dataset.id);
        // returns: [{"Id":"a04NS000004awPlYAI","Name__c":"Jeremy Louie","Role__c":"Flight Attendant","Base_Location__c":"Zamboanga City","Availability_Status__c":true},{"Id":"a04NS000004b3flYAA","Name__c":"Joseph Lee","Role__c":"Pilot","Base_Location__c":"Cebu City","Availability_Status__c":true}]

        event.dataTransfer.setData('text/plain', JSON.stringify({crewId: event.target.dataset.id}));
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleRemoveCrewAssignment(event) {
        
        // Log the IDs without JSON.parse
        const crewId = event.target.dataset.id;
        const crewAssignmentId = event.target.dataset.flightId;
    
        console.log('Crew ID:', crewId);
        console.log('Flight ID:', crewAssignmentId);
    
        // Call the remove function
        removeCrewFromFlight({ crewId: crewId, crewAssignmentId: crewAssignmentId })
            .then(() => {
                this.refreshData();
                this.handleSuccess('Crew member removed successfully');
            })
            .catch((error) => {
                // Handle error
                this.handleError('Error removing crew from flight:' + error);
            });
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({title: title, message: message, variant: variant}));
    }

    handleCreateCrewAssignment() {
        console.log('Create Crew Assignment button clicked');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Crew_Assignment__c', // Change to your object API name
                actionName: 'new'
            }
        });
    }


    handleEditCrewAssignment(event) {
        console.log('Edit Crew Assignment button clicked');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Crew_Assignment__c', // Change to your object API name
                actionName: 'edit',
                recordId: event.target.dataset.id
            }
        });
    }

    

    handleCreateCrew() {
        console.log('Create Crew button clicked');
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Crew__c', // Change to your object API name
                actionName: 'new'
            }
        });
    }

    async refreshData() {
        try {
            await Promise.all([
                refreshApex(this.wiredAssignmentsResult),
                refreshApex(this.wiredCrewResult),
                refreshApex(this.wiredAvailableCrewResult)
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.handleError(error);
        }
    }
}
