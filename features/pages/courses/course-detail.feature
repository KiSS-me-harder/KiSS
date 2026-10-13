Feature: Course Details

  View a specific course with its content, levels, and prerequisites.

  Scenario Outline: View course details
    When I navigate to the course page "<coursePath>"
    Then I see the course title and description
    And I see level groups with available levels
    And I see lesson cards displayed inside each level group

    Examples:
      | coursePath              |
      | /courses/carefree-bliss |
      | /courses/bimbo-behavior |
      | /courses/chastity-devotion |
      | /courses/command-compliance |
      | /courses/pet-training |
      | /courses/feminine-transformation |
      | /courses/hypnotic-suggestion |
      | /courses/elegance-poise |
      | /courses/cosmetic-basics |
      | /courses/discretion-mastery |
      | /courses/observation-skills |

  Scenario: Course prerequisites
    Given a course has prerequisite dependencies
    When I view the course listing
    Then courses with unmet prerequisites are shown as locked
