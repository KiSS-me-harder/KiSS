Feature: Study Plan

  Visual dependency graph of all courses across all degrees with subscription-based enrollment and planning.

  # ── Filter Degrees Segment ──

  Scenario: Filter degrees segment shows all available degrees
    Given I am on the Study Plan page
    Then I see a "Filter Degrees" section in the sidebar
    And every available degree is listed with a checkbox
    And each degree has a target title dropdown that appears when the degree is selected

  Scenario Outline: Degree target title dropdown options
    Given I am on the Study Plan page
    And I have selected the "<degree>" degree in the filter
    Then the target title dropdown for "<degree>" shows the following options: <titles>

    Examples:
      | degree | titles              |
      | Bimbo  | Junior, Senior, Master |

  Scenario Outline: Selecting a degree checkbox enables the target title dropdown
    Given I am on the Study Plan page
    And the "<degree>" degree is not selected
    When I check the "<degree>" degree checkbox
    Then the "<degree>" checkbox is checked
    And the target title dropdown for "<degree>" becomes visible
    And a default target title is selected

    Examples:
      | degree |
      | Bimbo  |

  Scenario Outline: Deselecting a degree checkbox hides the target title dropdown
    Given I am on the Study Plan page
    And the "<degree>" degree is selected with a target title
    When I uncheck the "<degree>" degree checkbox
    Then the "<degree>" checkbox is unchecked
    And the target title dropdown for "<degree>" is hidden
    And courses from "<degree>" are removed from my plan

    Examples:
      | degree |
      | Bimbo  |

  Scenario: Select All toggles all degree checkboxes
    Given I am on the Study Plan page
    And no degrees are selected
    When I click "Select All"
    Then every degree checkbox is checked
    And each degree has a default target title set
    And the button changes to "Deselect All"
    When I click "Deselect All"
    Then every degree checkbox is unchecked
    And the button changes to "Select All"

  # ── Subscription-Based Enrollment ──

  Scenario Outline: Selecting a degree and target title acts as a subscription
    Given I am on the Study Plan page
    And I am not enrolled in any courses for the "<degree>" degree
    When I select the "<degree>" degree and set the target title to "<title>"
    Then all courses required by "<degree>" "<title>" are added to my plan
    And the graph shows those courses

    Examples:
      | degree | title  |
      | Bimbo  | Junior |

  Scenario Outline: Courses not enrolled are shown semi-transparent
    Given I am on the Study Plan page
    And I have selected the "<degree>" degree with target title "<title>"
    And I am not enrolled in some of the courses required by that title
    Then the courses I am not enrolled in appear semi-transparent in the graph
    And the courses I am enrolled in appear fully opaque

    Examples:
      | degree | title  |
      | Bimbo  | Junior |

  Scenario Outline: Enrolled degrees are auto-selected on page load with correct target levels
    Given I have an active degree subscription for "<degree>" targeting "<title>"
    When I open the Study Plan page
    Then the "<degree>" degree checkbox is checked
    And the target title dropdown for "<degree>" is set to "<title>"
    And all courses required by "<degree>" "<title>" are included in the graph

    Examples:
      | degree | title  |
      | Bimbo  | Junior |

  Scenario Outline: Changing target title updates the plan
    Given I am on the Study Plan page
    And I have selected the "<degree>" degree with target title "<oldTitle>"
    When I change the target title to "<newTitle>"
    Then the graph updates to show courses required by "<newTitle>"
    And my plan is updated to include the new set of courses

    Examples:
      | degree | oldTitle | newTitle |
      | Bimbo  | Junior   | Senior   |

  # ── Graph Visualization ──

  Scenario: View study plan graph
    Given I am on the Study Plan page
    And I have at least one degree selected
    Then I see a dependency graph of courses
    And enrolled courses are highlighted with distinct colors
    And the graph shows prerequisite edges between courses

  Scenario: View legend
    Given I am on the Study Plan page
    Then I see a legend showing the meaning of each node color
    And the legend includes Student, Enrolled, Locked, In Progress, Planned, and Available states

  Scenario: Hover tooltip
    Given I am on the Study Plan page
    When I hover over a course node
    Then I see a tooltip with the course name, degree, level, and status

  Scenario: View node details
    Given I have selected a course node in the graph
    Then I see a detail panel showing the course name, degree, level, status, and prerequisites
    And I can navigate to the course page from the detail panel

  Scenario: Dependency path highlighting
    Given I have added a course to my plan
    Then the edges along the dependency path from me to that course are highlighted
    And courses on the path between me and the planned course are also highlighted

  # ── Plan Management ──

  Scenario: Add course to plan
    Given I have selected a course node in the graph
    When I click "Add to Plan"
    Then the course appears in my study plan list
    And the node is marked as planned

  Scenario: Remove course from plan
    Given I have a course in my study plan
    When I remove it from the plan
    Then it is no longer listed in my plan
    And the node is no longer marked as planned

  Scenario: Reset study plan
    Given I have courses in my study plan
    When I click reset
    Then all planned courses are cleared
    And the graph no longer shows planned node styling

  # ── Bulk Enrollment ──

  Scenario: Enroll All button shows count of enrollable courses
    Given I am on the Study Plan page
    And I have selected the "Bimbo" degree with target title "Junior"
    And there are enrollable courses I am not yet enrolled in
    Then the "Enroll All" button displays the count of enrollable courses

  Scenario: Bulk enroll in courses
    Given I have selected the "Bimbo" degree with target title "Junior"
    And there are courses in my plan that I am not yet enrolled in
    When I click "Enroll All"
    Then I am enrolled in all non-enrolled courses required by my selected titles
    And the enrollable count drops to zero
    And the "Enroll All" button becomes disabled

  Scenario: Enroll All is disabled when no degrees selected
    Given I am on the Study Plan page
    And no degrees are selected in the filter
    Then the "Enroll All" button is disabled

  # ── Graph Interaction ──

  Scenario: Pan and zoom graph
    Given I am on the Study Plan page
    When I use mouse wheel or zoom controls
    Then the graph zooms in or out
    And I can pan the graph by dragging

  Scenario: View graph on mobile
    Given I am on the Study Plan page on a small screen
    When I click "View Graph"
    Then a full-screen graph popup opens
    And I can select nodes and close the popup
