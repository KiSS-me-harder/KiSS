Feature: Degrees

  Browse available degree programs and their title levels.

  Scenario: Browse available degrees
    Given I am on the Degrees page
    Then I see a grid of available degrees
    And each degree shows its title and description
