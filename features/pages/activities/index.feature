Feature: Activities

  Log training sessions organized by category. Sessions contribute data to metrics.

  Scenario: Browse activities by category
    Given I am on the Activities page
    Then I see activities grouped by category
    And I can expand or collapse each category

  Scenario: Log a session
    Given I am viewing an activity with input fields
    When I enter values and submit
    Then the session is logged with a timestamp

  Scenario: View recent sessions
    Given I have logged sessions for an activity
    When I view the activity
    Then I see a list of recent sessions

  Scenario: Delete a session
    Given I have a logged session
    When I delete the session
    Then it is removed from the list
