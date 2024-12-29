# Step 1: Set Up Your Salesforce Environment

## Install Salesforce CLI:
- Download and install the Salesforce CLI.
- Verify installation by running `sfdx --version` in your terminal.

## Set Up Visual Studio Code (VS Code):
- Install VS Code.
- Add the Salesforce Extensions Pack from the VS Code marketplace.

## Create a Salesforce Developer Org:
- Sign up for a free Salesforce Developer Org.

## Authorize Your Org in VS Code:
1. Open VS Code and open the terminal.
2. Run:
   ```bash
   sfdx auth:web:login -d -a CrewScheduler
   ```
3. Log in to your org and ensure it’s set as the default org.

## Create a New Project in VS Code:
1. In the terminal, run:
   ```bash
   sfdx force:project:create -n CrewSchedulerApp
   ```
2. Navigate into the project folder:
   ```bash
   cd CrewSchedulerApp
   ```

## Push to Your Org:
- After building components, use:
   ```bash
   sfdx force:source:push
   ```

# Step 2: Design Your Data Model

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

# Step 3: Develop the LWC

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

# Step 4: Automate with Flows

## Notification Flow:
- Create a Flow to send notifications (e.g., email or in-app) to crew members when assigned to a flight.
- Trigger this Flow on the `Crew_Assignment` object.

# Step 5: Write the Apex Batch Job

## Create the Batch Apex Class:
- Check for availability conflicts in crew assignments.
### Example:
```java
public class CrewAvailabilityBatch implements Database.Batchable<SObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id, Crew__c, Date__c FROM Crew_Assignment__c');
    }

    public void execute(Database.BatchableContext bc, List<Crew_Assignment__c> scope) {
        for (Crew_Assignment__c assignment : scope) {
            // Check for conflicts and update status
        }
    }

    public void finish(Database.BatchableContext bc) {
        // Final actions
    }
}
```

## Schedule the Batch Job:
- Use a scheduled Apex class to run the batch daily.

# Step 6: Add Maps

## Integrate Maps in the LWC:
- Use the Google Maps API or the Salesforce Maps Lightning component.
- Display crew base locations or flight paths.

### Example Google Maps Setup:
- Include the API in your static resources.
- Use `lightning:map` or `<div>` with Google Maps integration.

# Step 7: Test and Deploy

## Test Locally:
- Test components in your org by previewing LWCs.
- Run unit tests for Apex using:
   ```bash
   sfdx force:apex:test:run
   ```

## Deploy to Production:
- If deploying to a live org, package your components and push them.
