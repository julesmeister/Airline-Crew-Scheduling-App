trigger UpdateCrewAvailability on Crew_Assignment__c (before update) {
    Set<Id> crewIdsToAssign = new Set<Id>();
    Set<Id> crewIdsToRemove = new Set<Id>();

    // Loop through the assignments to check for changes
    for (Integer i = 0; i < Trigger.new.size(); i++) {
        Crew_Assignment__c newAssignment = Trigger.new[i];
        Crew_Assignment__c oldAssignment = Trigger.old[i];

        // Check if a crew member is being assigned
        if (newAssignment.Crew__c != null && oldAssignment.Crew__c == null) {
            crewIdsToAssign.add(newAssignment.Crew__c);
        }
        // Check if a crew member is being removed
        else if (newAssignment.Crew__c == null && oldAssignment.Crew__c != null) {
            crewIdsToRemove.add(oldAssignment.Crew__c);
        }
    }

    // Update availability for assigned crew members
    if (!crewIdsToAssign.isEmpty()) {
        List<Crew__c> crewsToUpdate = [SELECT Id, Availability_Status__c FROM Crew__c WHERE Id IN :crewIdsToAssign];
        for (Crew__c crew : crewsToUpdate) {
            crew.Availability_Status__c = false; // Set to false when assigned
        }
        update crewsToUpdate;
    }

    // Update availability for removed crew members
    if (!crewIdsToRemove.isEmpty()) {
        List<Crew__c> crewsToUpdate = [SELECT Id, Availability_Status__c FROM Crew__c WHERE Id IN :crewIdsToRemove];
        for (Crew__c crew : crewsToUpdate) {
            crew.Availability_Status__c = true; // Set to true when unassigned
        }
        update crewsToUpdate;
    }
}