Feature: Degree Details

  View a specific degree, enroll in titles, and track progress.

  Scenario: View degree details
    Given I am viewing a degree detail page
    Then I see the degree description and available title levels
    And I can select a target title level

  Scenario: Enroll in a degree title
    Given I am viewing a degree with a selected target title
    When I click enroll
    Then I am enrolled in all classes for that title

  Scenario: Track degree progress
    Given I am enrolled in a degree title
    When I view the degree detail page
    Then I see the overall progress percentage
    And I see a letter grade based on completion

  Scenario: Unenroll from a degree
    Given I am enrolled in a degree title
    When I click unenroll
    Then I am removed from all classes in that title
