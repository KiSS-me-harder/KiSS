Feature: Club Details

  View a specific club's details, activities, and membership status.

  Scenario: View club details
    Given I navigate to a club page
    Then I see the club description and activities
    And I can join or leave the club

  Scenario: Club activities section is displayed
    Given I navigate to a club page that has activities defined
    Then I see a "Club Activities" section header with a sparkles icon
    And I see the subtitle "Complete challenges, games, and tasks to earn XP."
    And I see a progress summary showing completed count out of total activities
    And I see the total XP earned from completed activities
    And I see a progress bar reflecting the completion percentage

  Scenario Outline: Activity filter tabs show counts by type
    Given I navigate to a club page that has activities defined
    And the club has the following activities:
      | type      | title              | xp  |
      | challenge | <challenge_title>  | <xp>|
      | game      | <game_title>       | <xp>|
      | task      | <task_title>       | <xp>|
    Then I see filter tabs for All, Challenges, Games, and Tasks
    And the "All" tab shows the total count of all activities
    And the "Challenges" tab shows the count of challenge activities
    And the "Games" tab shows the count of game activities
    And the "Tasks" tab shows the count of task activities
    Examples:
      | challenge_title    | xp | game_title       | xp | task_title         | xp |
      | Mirror Confidence  | 50 | Fashion Runway    | 75 | Posture Practice   | 25 |
      | Walk Challenge     | 30 | Style Quiz        | 50 | Stretching Routine | 20 |

  Scenario: Activity cards display all required information
    Given I navigate to a club page that has activities defined
    Then each activity card displays:
      | Element       | Description                                      |
      | Type badge    | Shows the activity type (Challenge, Game, Task)  |
      | Title         | Shows the activity title                         |
      | Description   | Shows the activity description                   |
      | XP value      | Shows the XP reward prefixed with "+"            |
      | Icon          | Shows an icon matching the activity type         |
      | Completion    | Shows a checkbox indicating completion status    |

  Scenario: Activity type badges have distinct styling
    Given I navigate to a club page that has activities of all types
    Then challenge activity badges have orange styling
    And game activity badges have purple styling
    And task activity badges have emerald styling

  Scenario: Clicking filter tabs filters activities
    Given I navigate to a club page that has activities of all types
    When I click the "Challenges" filter tab
    Then only challenge activities are displayed
    When I click the "Games" filter tab
    Then only game activities are displayed
    When I click the "Tasks" filter tab
    Then only task activities are displayed
    When I click the "All" filter tab
    Then all activities are displayed regardless of type

  Scenario: Activity cards are clickable to toggle completion
    Given I navigate to a club page that has activities defined
    And an activity is not completed
    When I click the activity card
    Then the activity is marked as completed
    And the completion checkbox shows a check mark
    And the activity card shows a completed visual indicator
    And the completed count increases by one
    And the total XP earned increases by the activity XP value
    And the progress bar width updates to reflect the new completion percentage

  Scenario: Toggling a completed activity marks it incomplete
    Given I navigate to a club page that has activities defined
    And an activity is already completed
    When I click the activity card
    Then the activity is marked as incomplete
    And the completion checkbox is empty
    And the completed count decreases by one
    And the total XP earned decreases by the activity XP value

  Scenario: Activities section is hidden when no activities are defined
    Given I navigate to a club page with no activities defined
    Then I do not see a "Club Activities" section
