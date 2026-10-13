Feature: Profile

  Shows the student's personal information, enrolled courses, and progress statistics.

  Scenario: View profile
    Given I am on the Profile page
    Then I see my name, email, degree, and level
    And I see summary statistics

  Scenario: View enrolled courses
    Given I am enrolled in courses
    When I view my Profile
    Then I see enrolled courses with completion progress

  Scenario: Edit profile
    Given I am on the Profile page
    When I change my name or email and save
    Then the changes are confirmed
