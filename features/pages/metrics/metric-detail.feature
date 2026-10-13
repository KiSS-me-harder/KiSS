Feature: Metric Details

  View milestones for a specific metric and track achievement progress.

  Scenario: View metric milestones
    Given I navigate to a metric detail page
    Then I see the list of milestones
    And achieved milestones are visually distinguished

  Scenario: Metrics update from activity logging
    Given I have logged activity sessions that contribute to a metric
    When the metric threshold is reached
    Then the corresponding milestone is marked as achieved
