Feature: Age Verification Modal

  Displays an age verification gate before allowing access to the application.

  Scenario: Show age verification
    Given I am not yet verified
    When I access the application
    Then I see the age verification modal
    And I can confirm or deny my age
