Feature: Age Verification Modal

  Displays a modal gate requiring the user to confirm they are 18 or older before accessing the application.

  # ── Appearance ──

  Scenario: Modal displays required visual elements
    Given I am not yet verified
    When I access the application
    Then I see a modal overlay that blocks interaction with the page behind it
    And the modal is centered on the screen
    And the modal content is fully visible within the dialog bounds
    And I see a shield check icon inside a pink-to-purple gradient circle
    And I see the heading "Age Verification Required"
    And I see the description "You must be 18 years or older to access this content. Please confirm your age to continue."
    And I see the question "Are you 18 years or older?"
    And I see a "No, I'm under 18" button with outline styling
    And I see a "Yes, I'm 18+" button with a pink-to-purple gradient background

  Scenario: Modal is not dismissible
    Given I am not yet verified
    When I access the application
    Then the modal has no close button
    And clicking the overlay background does not close the modal

  # ── Confirm Age ──

  Scenario: User confirms they are 18 or older
    Given I am not yet verified
    When I access the application
    And I click the "Yes, I'm 18+" button
    Then the modal closes
    And I can access the application content
    And my age verification is saved

  Scenario: Verified user does not see the modal
    Given I have previously confirmed my age
    When I access the application
    Then I do not see the age verification modal
    And I can access the application content immediately

  # ── Deny Age ──

  Scenario: User denies they are 18 or older
    Given I am not yet verified
    When I access the application
    And I click the "No, I'm under 18" button
    Then I am redirected to an external website suitable for younger audiences
