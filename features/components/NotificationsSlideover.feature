Feature: Notifications Slideover

  Slide-out panel showing recent notifications and alerts.

  Scenario: View notifications
    Given I have unread notifications
    When I open the notifications panel
    Then I see a list of recent notifications
    And I can mark them as read
