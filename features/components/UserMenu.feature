Feature: User Menu

  Dropdown menu showing user profile options and navigation links.

  Scenario: Open user menu
    Given I am logged in
    When I click the user menu button
    Then I see profile, settings, and logout options
