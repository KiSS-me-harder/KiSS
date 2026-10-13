Feature: Today Tab

  Tabbed navigation for the Dashboard switching between tasks, routine, schedule, and calendar.
  Includes daily content recommendations for videos, audio, images, and books from the Library.

  Scenario: Switch tabs
    Given I am on the Dashboard
    When I click a different tab
    Then the corresponding dashboard section is shown

  Scenario: See today's recommended videos
    Given I am on the Dashboard
    Then I see a "Today's Videos" section
    And the "Today's Videos" section contains video cards
    And the "Today's Videos" section has a link to the Videos library page

  Scenario: See today's recommended audio
    Given I am on the Dashboard
    Then I see a "Today's Audio" section
    And the "Today's Audio" section contains audio cards
    And the "Today's Audio" section has a link to the Audio library page

  Scenario: See today's recommended images
    Given I am on the Dashboard
    Then I see a "Today's Images" section
    And the "Today's Images" section contains image cards
    And the "Today's Images" section has a link to the Images library page

  Scenario: See today's recommended books
    Given I am on the Dashboard
    Then I see a "Today's Books" section
    And the "Today's Books" section contains book cards
    And the "Today's Books" section has a link to the Books library page

  Scenario: Recommendation sections appear below schedule and tasks
    Given I am on the Dashboard
    Then the recommendation sections appear below the schedule and tasks sections
