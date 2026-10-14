Feature: Activity Detail Page

  As a student, I want to view detailed information about a specific activity
  so that I can learn how to perform it and log my sessions.

  Background:
    Given I am on the KiSS website

  Scenario: Viewing an activity detail page
    When I navigate to "/activities/butt-plug-wearing"
    Then I see the activity title "Butt Plug Wearing"
    And I see the activity icon
    And I see body content describing how to perform the activity
    And I see an activity log form with fields for the activity
    And I see recent sessions for the activity

  Scenario: Logging a session from the activity detail page
    Given I am on the activity detail page for "butt-plug-wearing"
    When I fill in the activity fields
    And I submit the form
    Then the session is logged
    And the recent sessions list is updated

  Scenario: Navigating from activity index to detail page
    Given I am on the activities index page
    When I click on an activity title
    Then I navigate to the activity detail page

  Scenario: Activity not found
    When I navigate to "/activities/nonexistent-activity"
    Then I see a message that the activity was not found
    And I see a link back to the activities index page

  Scenario: Related courses and degrees are shown
    Given I am on an activity detail page
    Then I see related courses or degrees that teach skills for this activity
