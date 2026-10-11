Feature: Study Plan

  Visual dependency graph of all classes across enrolled degrees with planning and filtering.

  Scenario: View study plan graph
    Given I am enrolled in at least one degree
    When I open the Study Plan page
    Then I see a dependency graph of classes
    And enrolled classes are highlighted
    And target-level classes are automatically included in my plan

  Scenario: Filter section is visible
    Given I am on the Study Plan page
    Then I see a filter section with degree checkboxes
    And each degree has a target title dropdown

  Scenario: Enrolled degrees are auto-selected on page load
    Given I am enrolled in one or more degrees with target titles
    When I open the Study Plan page
    Then the filter section has all my enrolled degrees selected
    And each selected degree shows the target title level I am aiming for
    And all classes required by those target titles are added to my plan
    And the dependency paths from me to those classes are highlighted

  Scenario: Filter by degree
    Given I am on the Study Plan page
    When I toggle degree filters
    Then the graph updates to show only the selected degrees

  Scenario: Add class to plan
    Given I have selected a class node in the graph
    When I click "Add to Plan"
    Then the class appears in my study plan list

  Scenario: Remove class from plan
    Given I have a class in my study plan
    When I remove it from the plan
    Then it is no longer listed in my plan

  Scenario: Reset study plan
    Given I have classes in my study plan
    When I click reset
    Then all planned classes are cleared

  Scenario: Select target title per degree
    Given I am on the Study Plan page
    When I select a target title for a degree
    Then the graph updates to show only classes required by that title
    And those classes are automatically added to my plan

  Scenario: Bulk enroll in classes
    Given I have selected degrees with target titles
    When I click "Enroll All"
    Then I am enrolled in all non-enrolled classes required by selected titles

  Scenario: View node details
    Given I have selected a class node in the graph
    Then I see a detail panel showing the class name, degree, level, status, and prerequisites
    And I can navigate to the class page from the detail panel

  Scenario: Hover tooltip
    Given I am on the Study Plan page
    When I hover over a class node
    Then I see a tooltip with the class name, degree, level, and status

  Scenario: View legend
    Given I am on the Study Plan page
    Then I see a legend showing the meaning of each node color
    And the legend includes Student, Enrolled, Locked, In Progress, Planned, and Available states

  Scenario: Dependency path highlighting
    Given I have added a class to my plan
    Then the edges along the dependency path from me to that class are highlighted
    And classes on the path between me and the planned class are also highlighted

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
