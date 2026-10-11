Feature: Today Schedule

  Displays the student's class schedule entries for the current day.

  Scenario: View schedule
    Given I am on the Dashboard
    When I open the Schedule tab
    Then I see my class schedule entries for the day
