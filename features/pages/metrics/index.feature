Feature: Metrics

  View training milestones and progress derived from logged activity data.

  Scenario: View metrics overview
    Given I am on the Metrics page
    Then I see an overall progress percentage
    And I see individual metric cards with scores
