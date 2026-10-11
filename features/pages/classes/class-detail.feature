Feature: Class Details

  View a specific class with its content, levels, and prerequisites.

  Scenario: View class details
    Given I navigate to a class page
    Then I see the class content and available levels
    And I can navigate between levels

  Scenario: Class prerequisites
    Given a class has prerequisite dependencies
    When I view the class listing
    Then classes with unmet prerequisites are shown as locked
