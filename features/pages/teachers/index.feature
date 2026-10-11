Feature: Teachers

  Browse AI teachers and chat with them for personalized guidance.

  Scenario: Browse teachers
    Given I am on the Teachers page
    Then I see a list of available teachers
    And each teacher shows their name, role, and department
