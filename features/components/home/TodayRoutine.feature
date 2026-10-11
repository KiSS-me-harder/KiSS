Feature: Today Routine

  Displays the student's daily routine tasks that can be toggled as done.

  Scenario: View routine
    Given I am on the Dashboard
    When I open the Routine tab
    Then I see my assigned routine tasks
    And I can toggle items as done
