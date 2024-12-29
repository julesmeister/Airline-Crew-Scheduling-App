import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAvailableCrew from '@salesforce/apex/CrewSchedulerController.getAvailableCrew';
import getAssignments from '@salesforce/apex/CrewSchedulerController.getAssignments';
import assignCrewToFlight from '@salesforce/apex/CrewSchedulerController.assignCrewToFlight';
import createCrewAssignment from '@salesforce/apex/CrewSchedulerController.createCrewAssignment'; // Optional: Import if needed
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CrewScheduler extends LightningElement {
    availableCrew = [];
    assignments = [];
    currentDate = new Date();
    timeSlots = [];
    error;

    // Wire the crew data
    @wire(getAvailableCrew)
    wiredCrew({ error, data }) {
        if (data) {
            this.availableCrew = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.availableCrew = [];
            this.showToast('Error', 'Error loading crew members', 'error');
        }
    }

    // Wire the assignments data
    @wire(getAssignments, { dateTimeVar: '$currentDate' })
    wiredAssignments({ error, data }) {
        if (data) {
            this.assignments = data;
            this.error = undefined;
            this.generateTimeSlots();
        } else if (error) {
            this.error = error;
            this.assignments = [];
            this.showToast('Error', 'Error loading crew assignments', 'error');
        }
    }

    // Generate time slots for the schedule grid
    generateTimeSlots() {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            slots.push(i.toString().padStart(2, '0') + ':00');
        }
        this.timeSlots = slots;
    }

    // Handle crew assignment
    async handleDrop(event) {
        event.preventDefault();
        const crewData = JSON.parse(event.dataTransfer.getData('text/plain'));
        const timeSlot = event.target.dataset.timeSlot;
        
        // Calculate departure and arrival times based on the time slot
        const departureTime = new Date(this.currentDate);
        departureTime.setHours(parseInt(timeSlot), 0, 0, 0);
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(departureTime.getHours() + 2); // Default 2-hour flight duration
        
        try {
            // assignCrewToFlight method usage: 
            // Assigns a crew member to a flight with the given parameters.
            // Parameters:
            // - crewId: The ID of the crew member to assign.
            // - flightNumber: The number of the flight to assign the crew member to.
            // - role: The role of the crew member in the flight.
            // - departureTime: The departure time of the flight.
            // - arrivalTime: The arrival time of the flight.
            // - departureLocation: The departure location of the flight.
            // - arrivalLocation: The arrival location of the flight.
            await assignCrewToFlight({
                crewId: crewData.crewId,
                flightNumber: 'FL' + timeSlot, // Generate a flight number
                role: crewData.role,
                departureTime: departureTime,
                arrivalTime: arrivalTime,
                departureLocation: null, // These would need to be set based on your UI
                arrivalLocation: null
            });

            // Refresh the data
            await refreshApex(this.wiredAssignments);
            this.showToast('Success', 'Crew member assigned successfully', 'success');
        } catch (error) {
            this.showToast('Error', error.message, 'error');
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
        return this.currentDate.toLocaleDateString();
    }

    // Drag and Drop Handlers
    handleDragStart(event) {
        const crewId = event.target.dataset.id;
        const crewRole = event.target.dataset.role;
        event.dataTransfer.setData('text/plain', JSON.stringify({
            crewId: crewId,
            role: crewRole
        }));
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}