Feature: Lesson Progress

  Lessons have three parts: flashcards, homework, and exams.
  A lesson is completed when all three parts are finished.

  Background:
    Given I am enrolled in a course

  Scenario Outline: Flashcards section
    When I navigate to lesson "<lessonPath>"
    Then I see a flashcards section
    And I can answer each flashcard question
    And correct answers are recorded

    Examples:
      | lessonPath |
      | /courses/anal-fundamentals/100 |

  Scenario Outline: Homework section
    When I navigate to lesson "<lessonPath>"
    Then I see a homework section with checklist items
    And I can check off each homework item
    And checked items are persisted

    Examples:
      | lessonPath |
      | /courses/anal-fundamentals/100 |

  Scenario Outline: Exam section with milestone references
    When I navigate to lesson "<lessonPath>"
    Then I see an exam section with milestone milestones
    And each milestone shows my current progress toward the target
    And achieved milestones are marked as complete

    Examples:
      | lessonPath |
      | /courses/anal-fundamentals/100 |

  Scenario: Lesson auto-completes when all parts are done
    Given I am on a lesson with flashcards, homework, and exam milestones
    When all flashcards are answered correctly
    And all homework items are checked off
    And all exam milestones are achieved
    Then the lesson is automatically marked as completed

  Scenario: Lesson does not complete if any part is unfinished
    Given I am on a lesson with flashcards, homework, and exam milestones
    When some flashcards are unanswered
    Then the lesson is not marked as completed

  Scenario: Lesson does not complete if homework is unfinished
    Given I am on a lesson with flashcards, homework, and exam milestones
    When all flashcards are answered correctly
    And some homework items are unchecked
    Then the lesson is not marked as completed

  Scenario: Lesson does not complete if exam milestones are not achieved
    Given I am on a lesson with flashcards, homework, and exam milestones
    When all flashcards are answered correctly
    And all homework items are checked off
    And some exam milestones are not achieved
    Then the lesson is not marked as completed

  Scenario: Next lesson button shows only when eligible
    Given I have completed lesson 100
    When I view lesson 100
    Then I see a next lesson button linking to lesson 103
    And the button is enabled

  Scenario: Next lesson button hidden when not eligible
    Given I have not completed the current lesson
    When I view the lesson
    Then I do not see a next lesson button

  Scenario: Navigation guard redirects to course page if prerequisites not met
    Given I have not completed the prerequisite for lesson 103
    When I try to navigate to lesson 103
    Then I am redirected to the course details page

  Scenario: Navigation allowed when prerequisites are met
    Given I have completed the prerequisite for lesson 103
    When I try to navigate to lesson 103
    Then I can view the lesson page
