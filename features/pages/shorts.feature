Feature: Shorts

  A video doom-scrolling page that surfaces short-form video content from enrolled courses and degrees, prioritizing videos the user has not yet watched.

  Scenario: Navigate to the Shorts page
    Given I am enrolled in at least one course
    When I navigate to the Shorts page
    Then I see a full-screen vertical video feed
    And the first video is from a course or degree I am enrolled in

  Scenario: Videos are filtered by enrollment
    Given I am enrolled in the "bimbo-behavior" course
    And I am not enrolled in the "aerial-awareness" course
    When I navigate to the Shorts page
    Then I see videos related to "bimbo-behavior"
    And I do not see videos related to "aerial-awareness"

  Scenario: Unviewed videos are prioritized
    Given I have viewed some shorts videos before
    When I navigate to the Shorts page
    Then unviewed videos appear before previously viewed videos

  Scenario: Scrolling loads the next video
    Given I am on the Shorts page
    When I scroll down
    Then the next video in the feed appears

  Scenario: Viewed videos are tracked
    Given I am on the Shorts page
    When I watch a video for at least five seconds
    Then the video is marked as viewed

  Scenario: Video shows course and title metadata
    Given I am on the Shorts page
    Then each video displays its title
    And each video displays the associated course name

  Scenario: Empty state when no enrollments
    Given I am not enrolled in any courses or degrees
    When I navigate to the Shorts page
    Then I see a message prompting me to enroll in courses

  Scenario: Video playback controls are available
    Given I am on the Shorts page
    Then I can pause and play the current video
    And I can mute and unmute the current video
