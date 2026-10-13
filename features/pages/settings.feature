Feature: Settings

  Configure account preferences including notifications, privacy, appearance, and security.

  Scenario: Configure notifications
    Given I am on the Settings page
    When I toggle notification preferences
    Then my notification settings are saved

  Scenario: Configure privacy
    Given I am on the Settings page
    When I toggle privacy options
    Then my privacy settings are updated

  Scenario: Configure appearance
    Given I am on the Settings page
    When I change theme or font size
    Then the appearance settings are applied

  Scenario: Configure media player
    Given I am on the Settings page
    When I adjust haptics or binaural beats settings
    Then the media player configuration is updated

  Scenario: Change password
    Given I am on the Settings page
    When I enter my current password and a new password
    Then the password change is confirmed
