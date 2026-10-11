Feature: Flashcards

  Spaced-repetition study system using cards from enrolled classes.

  Scenario: Study flashcards
    Given I am enrolled in classes with flashcards
    When I open the Flashcards page
    Then I see a card with a question and multiple-choice options

  Scenario: Answer correctly
    Given I am viewing a flashcard question
    When I select the correct answer
    Then I receive positive feedback
    And the card's review interval increases

  Scenario: Answer incorrectly
    Given I am viewing a flashcard question
    When I select an incorrect answer
    Then the correct answer is revealed
    And a new random card is shown

  Scenario: View knowledge breakdown
    Given I have answered several flashcards
    When I open the knowledge panel
    Then I see my accuracy percentage by degree and class
