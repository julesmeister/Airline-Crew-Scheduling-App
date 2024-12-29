public with sharing class CrewSchedulerController {
    
    @AuraEnabled(cacheable=true)
    public static List<Crew__c> getAvailableCrew() {
        return [SELECT Id, Name__c, Role__c, Base_Location__c, Availability_Status__c FROM Crew__c WHERE Availability_Status__c = true];
    }

    @AuraEnabled(cacheable=true)
    public static List<Crew_Assignment__c> getAssignments(DateTime dateTimeVar) {
        return [SELECT Id, Crew__r.Name, Flight__c, Role__c, 
                Departure__c, Arrival__c, 
                Departure_Location__c, Arrival_Location__c 
                FROM Crew_Assignment__c 
                WHERE Departure__c >= :dateTimeVar 
                AND Departure__c < :dateTimeVar.addDays(1)
                ORDER BY Departure__c ASC];
    }

    @AuraEnabled
    public static void createCrewAssignment(Id crewId, String flightNumber, String role, 
                                            DateTime departureTime, DateTime arrivalTime,
                                            Decimal departureLatitude, Decimal departureLongitude, 
                                            Decimal arrivalLatitude, Decimal arrivalLongitude) {
        Crew_Assignment__c assignment = new Crew_Assignment__c(
            Crew__c = crewId,
            Flight__c = flightNumber,
            Role__c = role,
            Departure__c = departureTime,
            Arrival__c = arrivalTime
        );

        // Set the geolocation values separately
        assignment.Departure_Location__Latitude__s = departureLatitude.setScale(2, RoundingMode.HALF_UP);
        assignment.Departure_Location__Longitude__s = departureLongitude.setScale(2, RoundingMode.HALF_UP);
        assignment.Arrival_Location__Latitude__s = arrivalLatitude.setScale(2, RoundingMode.HALF_UP);
        assignment.Arrival_Location__Longitude__s = arrivalLongitude.setScale(2, RoundingMode.HALF_UP);

        insert assignment;
    }

    @AuraEnabled
    public static void assignCrewToFlight(Id crewId, String flightNumber, String role, 
                                            DateTime departureTime, DateTime arrivalTime,
                                            Decimal departureLatitude, Decimal departureLongitude, 
                                            Decimal arrivalLatitude, Decimal arrivalLongitude) {
        createCrewAssignment(crewId, flightNumber, role, departureTime, arrivalTime, departureLatitude, departureLongitude, arrivalLatitude, arrivalLongitude);
    }
}