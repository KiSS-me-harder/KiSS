Feature: Today Tab

  Tabbed navigation for the Dashboard switching between tasks, routine, schedule, and calendar.

  Scenario: Switch tabs
    Given I am on the Dashboard
    When I click a different tab
    Then the corresponding dashboard section is shown
