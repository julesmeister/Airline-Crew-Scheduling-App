public with sharing class CrewSchedulerController {
    
   @AuraEnabled(cacheable=true)
   public static List<Crew__c> getAvailableCrew() {
       try {
           return [SELECT Id, Name__c, Role__c, Base_Location__c, Availability_Status__c 
                   FROM Crew__c 
                   WHERE Availability_Status__c = true];
       } catch (Exception e) {
           System.debug('Error retrieving available crew: ' + e.getMessage());
           throw new AuraHandledException('Error retrieving available crew: ' + e.getMessage());
       }
   }

   @AuraEnabled(cacheable=true)
   public static List<Crew__c> getCrews() {
       try {
           return [SELECT Id, Name__c, Role__c, Base_Location__c, Availability_Status__c 
                   FROM Crew__c];
       } catch (Exception e) {
           System.debug('Error retrieving available crew: ' + e.getMessage());
           throw new AuraHandledException('Error retrieving available crew: ' + e.getMessage());
       }
   }

    @AuraEnabled
    public static void updateCrewAvailability(String crewId, Boolean availabilityStatus) {
        // Check if the crewId is not null
        if (crewId == null) {
            throw new AuraHandledException('Crew ID cannot be null.');
        }
        
        // Query the crew member
        Crew__c crewMember = [SELECT Id, Availability_Status__c FROM Crew__c WHERE Id = :crewId LIMIT 1];
        
        // Update the availability status
        crewMember.Availability_Status__c = availabilityStatus;
        
        // Perform the update
        update crewMember;
    }

    @AuraEnabled(cacheable=true)
    public static List<Crew_Assignment__c> getAssignments(DateTime dateTimeVar) {
        // Check if dateTimeVar is not null
        if (dateTimeVar == null) {
            throw new AuraHandledException('DateTime variable cannot be null.');
        }
    
        Date startDate = dateTimeVar.date(); // Get the Date part
        DateTime startOfDay = DateTime.newInstance(startDate, Time.newInstance(0, 0, 0, 0)); // Create a Datetime at midnight
    
        try {
            return [SELECT Id, Crew__r.Name, Flight__c, Role__c, 
                    Departure__c, Arrival__c, 
                    Departure_Location__c, Arrival_Location__c 
                    FROM Crew_Assignment__c 
                    WHERE Departure__c >= :startOfDay 
                    AND Departure__c < :startOfDay.addDays(1)
                    ORDER BY Departure__c ASC];
        } catch (Exception e) {
            System.debug('Error retrieving crew assignments: ' + e.getMessage());
            throw new AuraHandledException('Error retrieving crew assignments: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void removeCrewFromFlight(String crewId, String crewAssignmentId) {
        try {
            Crew_Assignment__c assignment = [SELECT Id, Crew__c FROM Crew_Assignment__c WHERE Id = :crewAssignmentId LIMIT 1];
            assignment.Crew__c = null;
            update assignment;
            updateCrewAvailability(crewId, true);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }



   @AuraEnabled
   public static void assignCrewToFlight(String crewId, String crewAssignmentId) {
       try {
           // Query the Crew_Assignment__c record that needs to be updated
           Crew_Assignment__c assignment = [SELECT Id, Crew__c FROM Crew_Assignment__c WHERE Id = :crewAssignmentId LIMIT 1];
   
           // Update the Crew__c field
           assignment.Crew__c = crewId; // Set the Crew__c field to the crew ID
   
           // Perform the update
           update assignment;
           updateCrewAvailability(crewId, false);
       } catch (DmlException e) {
           System.debug('Error assigning crew to flight: ' + e.getMessage());
           throw new AuraHandledException('Error assigning crew to flight: ' + e.getMessage());
       }
   }
}