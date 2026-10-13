Feature: Spiral Visuals Creator

  Create and customize hypnotic spiral visual effects for focus and relaxation.

  Scenario: View Spiral Visuals Creator
    Given I am on the Spiral Visuals Creator page
    Then I see controls to configure spiral visuals
    And I can set the spiral color
    And I can set the rotation speed
    And I can select the spiral direction
    And I can choose a spiral template

  Scenario: Generate spiral visuals
    Given I am on the Spiral Visuals Creator page
    When I set the spiral color
    And I set the rotation speed
    And I start the spiral animation
    Then the hypnotic spiral animation plays with the configured settings

  Scenario: Stop spiral visuals
    Given I am on the Spiral Visuals Creator page
    And the spiral animation is currently playing
    When I stop the spiral animation
    Then the animation stops

  Scenario: Change spiral direction to backward
    Given I am on the Spiral Visuals Creator page
    When I set the spiral direction to backward
    And I start the spiral animation
    Then the spiral rotates in the backward direction

  Scenario: Change spiral direction to forward
    Given I am on the Spiral Visuals Creator page
    And the spiral direction is set to backward
    When I set the spiral direction to forward
    Then the spiral rotates in the forward direction

  Scenario: Select different spiral templates
    Given I am on the Spiral Visuals Creator page
    When I select the "Concentric Rings" spiral template
    And I start the spiral animation
    Then the spiral renders using the Concentric Rings pattern

  Scenario: Fullscreen the spiral visuals
    Given I am on the Spiral Visuals Creator page
    When I click the fullscreen button
    Then the spiral canvas enters fullscreen mode

  Scenario: Exit fullscreen mode
    Given I am on the Spiral Visuals Creator page
    And the spiral canvas is in fullscreen mode
    When I exit fullscreen
    Then the spiral canvas returns to normal view

  Scenario: Play button is centered on canvas
    Given I am on the Spiral Visuals Creator page
    Then I see a play button centered on the spiral canvas

  Scenario: Play button hides while playing
    Given I am on the Spiral Visuals Creator page
    When I start the spiral animation
    Then the centered play button is hidden

  Scenario: Toggle play with spacebar
    Given I am on the Spiral Visuals Creator page
    When I press the spacebar
    Then the spiral animation starts playing
    When I press the spacebar again
    Then the spiral animation pauses

  Scenario: Adjust speed slider
    Given I am on the Spiral Visuals Creator page
    When I adjust the speed slider
    Then the speed value updates
