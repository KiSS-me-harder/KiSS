Feature: Today Schedule Edit

  Allows adding and removing course schedule entries for the day.

  Scenario: Edit schedule
    Given I am on the Dashboard
    When I open the Schedule tab
    Then I can add or remove schedule entries
