import { LightningElement, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class FlightMap extends LightningElement {
    origin = 'Manila';
    destination = 'Zamboanga';
    country = 'Philippines';


    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('showMap', this.handleShowMap, this); // Added listener for showMap event
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    mapMarkers = [
        {
            location: {
                City: this.origin,
                Country: this.country
            },
            title: this.origin,
            description: 'This is ' + this.origin,
            icon: 'standard:location'
        },
        {
            location: {
                City: this.destination,
                Country: this.country
            },
            title: this.destination,
            description: 'This is ' + this.destination,
            icon: 'standard:location'
        }
    ];

    centerPosition = {
        Latitude: -34.9285,
        Longitude: 138.6007
    };

    handleShowMap(data) {
        console.log('Received showMap event with data:', data); // Log the received data
        const [origin, destination] = data; // Destructure the data array
        console.log('Origin:', origin, 'Destination:', destination); // Log the individual values
    
        // Update the mapMarkers with the new origin and destination
        this.mapMarkers = [
            {
                location: {
                    City: origin,
                    Country: this.country // Assuming you want to keep the same country
                },
                title: origin,
                description: 'This is ' + origin,
                icon: 'standard:location'
            },
            {
                location: {
                    City: destination,
                    Country: this.country // Assuming you want to keep the same country
                },
                title: destination,
                description: 'This is ' + destination,
                icon: 'standard:location'
            }
        ];
    }
}