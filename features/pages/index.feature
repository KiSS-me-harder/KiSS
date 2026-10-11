Feature: Dashboard

  The Dashboard is the central hub showing today's tasks, routines, schedule, and calendar.

  Scenario: View today's tasks
    Given I am on the Dashboard
    Then I see tasks due today
    And I can mark tasks as complete

  Scenario: View daily routine
    Given I am on the Dashboard
    Then I see my assigned routine tasks
    And I can toggle routine items as done

  Scenario: Manage daily schedule
    Given I am on the Dashboard
    Then I see my class schedule for the day
    And I can add or remove schedule entries

  Scenario: View calendar
    Given I am on the Dashboard
    Then I see a calendar of upcoming events
