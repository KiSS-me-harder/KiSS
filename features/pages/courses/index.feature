Feature: Courses

  Browse all courses organized by tier levels and degrees.

  Scenario: Browse all courses
    Given I am on the Courses page
    Then I see courses grouped by tier level
    And each course shows its title, degree, and level

  Scenario: Course cards link to the course detail page
    Given I am on the Courses page
    Then course cards should link to the course detail page
    And course cards should not link directly to a level page

  Scenario: Courses with unmet prerequisites show visual indicators
    Given I am on the Courses page
    And some courses have unmet prerequisites
    Then those course cards should have a blurred background image
    And the course title and text remain visible on top of the blur
    And a lock badge should be displayed on the card
    And the lock badge should display a lockpad icon
    And the lock badge should display the abbreviated prerequisite course and level next to the lockpad
    And each lock badge should function as a direct link to the prerequisite course page
    And hovering the card should remove the blur
    And the card should still be clickable and navigate to the course page

  Scenario Outline: Lock badge shows abbreviated prerequisite label and links to prerequisite course
    Given I am on the Courses page
    And the course "<courseName>" has an unmet prerequisite "<prerequisiteName>"
    Then the lock badge on the "<courseName>" card should display "<abbreviatedLabel>"
    And clicking the lock badge should navigate to the "<prerequisiteSlug>" course page

    Examples:
      | courseName       | prerequisiteName       | abbreviatedLabel | prerequisiteSlug |
      | aerial awareness | anal fundamentals      | AF100            | /courses/anal-fundamentals |
      | cloud computing  | aerial awareness       | AA200            | /courses/aerial-awareness  |
