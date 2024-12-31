# Airline Crew Scheduler

The Airline Crew Scheduler is a custom Lightning Web Component (LWC) designed to facilitate the scheduling of crew members for flights. It allows users to manage crew assignments efficiently, ensuring that all flights are adequately staffed while considering crew availability and roles.

## Overview

The Airline Crew Scheduler is a powerful tool for airlines to streamline their crew management process. With this component, airlines can easily schedule crew members for flights, taking into account their availability and roles. The scheduler also allows for the integration of maps to display crew base locations and flight paths.

---

## Custom Objects:

### Crew Object

| Field Name            | Field                | Type       | Purpose                                                         |
|-----------------------|----------------------|------------|-----------------------------------------------------------------|
| Name__c               | Name                 | Text       | Crew member’s full name.                                       |
| Role__c               | Role                 | Picklist   | Defines the role (e.g., Pilot, Attendant).                    |
| Base_Location__c      | Base Location        | Geolocation | Stores the crew member's base location.                        |
| Availability_Status__c | Availability Status   | Checkbox   | Tracks if the member is available.                             |

### Crew Assignment Object

| Field Name            | Field                | Type       | Purpose                                                         |
|-----------------------|----------------------|------------|-----------------------------------------------------------------|
| Crew__c               | Crew                 | Lookup     | Links to a specific crew member.                               |
| Flight__c             | Flight               | Text       | Identifies the flight (e.g., flight number).                  |
| Role__c               | Role                 | Picklist   | Defines the crew’s role on this flight.                        |
| Departure__c          | Departure Time       | Datetime   | Scheduled flight departure.                                     |
| Arrival__c            | Arrival Time         | Datetime   | Scheduled flight arrival.                                       |
| Departure_Location__c  | Departure Location    | Geolocation | Latitude/Longitude of departure airport.                       |
| Arrival_Location__c   | Arrival Location      | Geolocation | Latitude/Longitude of arrival airport.                         |

## Create the Objects:
- Use Salesforce Setup UI or deploy a `Crew__c` and `Crew_Assignment__c` object via object-meta.xml files in your project.


## Create the LWC:
1. In the terminal, run:
   ```bash
   sfdx force:lightning:component:create --type lwc --componentname CrewScheduler --outputdir force-app/main/default/lwc
   ```

## Build the Scheduler:
- Use a drag-and-drop library like interact.js or native HTML5 drag-and-drop.
- Display flights in a grid with crew members available for scheduling.

### Example LWC Template:
```html
<template>
    <div class="scheduler">
        <div class="crew-list">
            <!-- List of Crew Members -->
        </div>
        <div class="flight-schedule">
            <!-- Flights and Drag-Drop Areas -->
        </div>
    </div>
</template>
```

## Fetch Data with Apex:
- Write an Apex controller to fetch Crew and Crew_Assignment data.

# Automate with Flows

## Notification Flow:
- Create a Flow to send notifications (e.g., email or in-app) to crew members when assigned to a flight.
- Trigger this Flow on the `Crew_Assignment` object.


# Add Maps

## Integrate Maps in the LWC:
- Use the Google Maps API or the Salesforce Maps Lightning component.
- Display crew base locations or flight paths.

### Example Google Maps Setup:
- Include the API in your static resources.
- Use `lightning:map` or `<div>` with Google Maps integration.
