Feature: Club Details

  View a specific club's details, activities, and membership status.

  Scenario: View club details
    Given I navigate to a club page
    Then I see the club description and activities
    And I can join or leave the club
