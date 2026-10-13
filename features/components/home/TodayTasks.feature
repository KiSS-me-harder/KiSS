Feature: Today Tasks

  Displays the tasks due today that can be marked as complete.

  Scenario: View tasks
    Given I am on the Dashboard
    When I open the Today tab
    Then I see tasks due today
    And I can mark tasks as complete
