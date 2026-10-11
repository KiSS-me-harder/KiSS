Feature: Profile

  Shows the student's personal information, enrolled classes, and progress statistics.

  Scenario: View profile
    Given I am on the Profile page
    Then I see my name, email, degree, and level
    And I see summary statistics

  Scenario: View enrolled classes
    Given I am enrolled in classes
    When I view my Profile
    Then I see enrolled classes with completion progress

  Scenario: Edit profile
    Given I am on the Profile page
    When I change my name or email and save
    Then the changes are confirmed
