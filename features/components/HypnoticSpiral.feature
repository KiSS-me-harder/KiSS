Feature: Hypnotic Spiral

  Displays a hypnotic spiral visual effect for focus and relaxation.

  Scenario: Show spiral
    Given I have hypnotic spiral enabled
    When I start a study session
    Then the hypnotic spiral animation plays
