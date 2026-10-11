Feature: Classes

  Browse all classes organized by tier levels and degrees.

  Scenario: Browse all classes
    Given I am on the Classes page
    Then I see classes grouped by tier level
    And each class shows its title, degree, and level
