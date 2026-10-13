Feature: Tools

  A collection of utility tools for focus and relaxation.

  Scenario: View available tools
    Given I am on the Tools page
    Then I see a list of available tools
    And I see a link to the Binaural Beats Creator
    And I see a link to the Spiral Visuals Creator
    And I see a link to the Video Censor

  Scenario: Navigate to Binaural Beats Creator
    Given I am on the Tools page
    When I click on the Binaural Beats Creator
    Then I am navigated to the Binaural Beats Creator page

  Scenario: Navigate to Spiral Visuals Creator
    Given I am on the Tools page
    When I click on the Spiral Visuals Creator
    Then I am navigated to the Spiral Visuals Creator page

  Scenario: Navigate to Video Censor
    Given I am on the Tools page
    When I click on the Video Censor
    Then I am navigated to the Video Censor page
