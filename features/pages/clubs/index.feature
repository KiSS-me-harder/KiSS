Feature: Clubs

  Browse and join clubs with group activities and challenges.

  Scenario: Browse available clubs
    Given I am on the Clubs page
    Then I see a list of available clubs
    And each club shows its title and required degree

  Scenario: Join a club
    Given I am viewing a club and meet the prerequisite
    When I click join
    Then I become a member

  Scenario: Cannot join without prerequisite
    Given I am viewing a club with a degree prerequisite
    And I am not enrolled in the required degree
    When I attempt to join
    Then I see a warning that the prerequisite is required

  Scenario: Complete club activities
    Given I am a member of a club
    When I view the club activities
    Then I see challenges and tasks
    And I can mark activities as complete

  Scenario: Leave a club
    Given I am a member of a club
    When I click leave
    Then I am no longer a member
