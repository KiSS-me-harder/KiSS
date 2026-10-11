Feature: Students

  Discussion board for creating threads, replying, and connecting with fellow students.

  Scenario: Browse discussion threads
    Given I am on the Students page
    Then I see a list of discussion threads
    And I can filter threads by category

  Scenario: Create a new thread
    Given I am on the Students page
    When I click "New Thread" and fill in the form
    Then a new thread appears in the list

  Scenario: View active students
    Given I am on the Students page
    Then I see a sidebar listing active students
