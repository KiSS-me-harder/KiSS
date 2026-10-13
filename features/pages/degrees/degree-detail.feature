Feature: Degree Details

  View a specific degree program, select a target title, review prerequisite courses,
  enroll in the degree, track progress, and see the final exam requirements.

  ## Page layout and header

  Scenario Outline: Navigate to a degree detail page
    When I navigate to the degree page "<degreePath>"
    Then I see the page loaded with degree content
    And I see a breadcrumb with "Degrees" and the degree title

    Examples:
      | degreePath          |
      | /degrees/fitness    |
      | /degrees/bimbo      |
      | /degrees/chaste     |
      | /degrees/hypnosub   |
      | /degrees/obedient   |

  Scenario: Degree hero image is displayed
    Given I navigate to a degree detail page
    Then I see a hero image on the left side of the page
    And the image has an alt attribute matching the degree title

  Scenario: Degree title and description are displayed
    Given I navigate to a degree detail page
    Then I see the degree title as a heading
    And I see the degree description text below the title

  Scenario: Degree body content is rendered when present
    Given I navigate to a degree detail page with body content
    Then I see the body content rendered below the description

  ## Title selector

  Scenario: Title selector is displayed without header
    Given I navigate to a degree detail page
    Then I see a title selector card
    And I do not see a "Target Title" section header

  Scenario: Title levels are listed with details
    Given I navigate to a degree detail page
    Then I see a list of title levels
    And each title level shows its name, class count, and description
    And the first title level is selected by default

  Scenario: Selecting a different title level updates the view
    Given I navigate to a degree detail page
    And the first title level is selected
    When I click on the second title level
    Then the second title level becomes selected
    And the Curriculum section updates to show cumulative courses up to the selected level

  Scenario: Completed title levels show a trophy icon
    Given I am enrolled in a degree title and have completed it
    When I view the degree detail page
    Then I see a trophy icon next to the completed title level

  Scenario: Locked title levels show a lock icon
    Given I am viewing a degree detail page
    And a previous title level is not completed
    Then I see a lock icon next to the uncompleted subsequent title level

  Scenario: Title level badges have distinct colors
    Given I navigate to a degree detail page with multiple title levels
    Then the first title level badge has amber styling
    And the second title level badge has blue styling
    And the third title level badge has purple styling

  ## Enrollment button

  Scenario: Enrollment button is displayed below title selector
    Given I navigate to a degree detail page
    And I am not enrolled in the degree
    Then I see an enrollment confirmation button below the title selector
    And the button text includes the selected title name

  ## Curriculum section

  Scenario: Curriculum section shows cumulative courses from all titles
    Given I navigate to a degree detail page
    Then I see a "Curriculum" section header with a book icon
    And the section header shows the selected title name
    And a badge shows the total course count
    And the curriculum lists all courses from the selected title and all lower titles

  Scenario: Selecting higher title adds courses from lower titles
    Given I navigate to a degree detail page
    And the first title level is selected
    When I click on the second title level
    Then the curriculum includes courses from both the first and second title levels
    And duplicate courses are not listed multiple times

  Scenario: Curriculum course cards are clickable links
    Given I navigate to a degree detail page
    Then each curriculum course card is a clickable link to the course detail page

  Scenario: Curriculum course cards display course information
    Given I navigate to a degree detail page
    Then each curriculum course card displays:
      | Element       | Description                                      |
      | Thumbnail     | Shows a course image                             |
      | Title         | Shows the course title                           |
      | Tier badge    | Shows the tier level                             |
      | Level count   | Shows the number of levels                       |
      | Enrollment icon | Shows check circle if enrolled, circle if not |

  Scenario: Enrolled courses in curriculum show progress bar
    Given I am enrolled in some courses of a degree title
    When I view the Curriculum section
    Then enrolled course cards show a progress bar
    And the progress bar shows completed levels out of total levels

  Scenario: Curriculum shows overall progress summary
    Given I navigate to a degree detail page
    Then I see an "Overall progress" summary at the bottom of the Curriculum section
    And the summary shows the overall progress percentage
    And I see a letter grade in the progress summary
    And I see a progress bar reflecting the overall progress

  ## Enrollment actions

  Scenario: Enroll button is visible below title selector when not enrolled
    Given I navigate to a degree detail page
    And I am not enrolled in the degree
    Then I see an "Enroll in" button below the title selector
    And the button text includes the selected title name

  Scenario: Enrolling enrolls only in courses with met prerequisites
    Given I navigate to a degree detail page
    And I am not enrolled in the degree
    When I click the enroll button
    Then I am enrolled in the degree
    And I am enrolled only in courses whose prerequisites are met
    And I am not enrolled in courses whose prerequisites are not met
    And the enroll button text changes to reflect enrollment status

  Scenario: Complete Enrollment adds newly available courses
    Given I am enrolled in a degree and have completed some courses
    When I click the "Complete Enrollment" button
    Then I am enrolled in any additional courses whose prerequisites are now met
    And I am still not enrolled in courses whose prerequisites remain unmet

  Scenario: Complete Enrollment button shows for partial enrollment
    Given I am partially enrolled in a degree title
    When I view the degree detail page
    Then I see a "Complete Enrollment" button below the title selector
    And I see the text "You're partially enrolled" below the button

  Scenario: Unenroll button is visible when partially enrolled
    Given I am partially enrolled in a degree title
    When I view the degree detail page
    Then I see an "Unenroll from all classes" button with a minus icon

  Scenario: Unenrolling removes all course enrollments
    Given I am enrolled in a degree title
    When I click the unenroll button
    Then I am removed from all courses in that title
    And the enroll button reappears

  Scenario: Enroll button is hidden when fully enrolled
    Given I am fully enrolled in a degree title
    When I view the degree detail page
    Then I do not see an "Enroll in" button

  ## Auto enrollment on course completion

  Scenario: Completing a course unlocks and enrolls in dependent courses
    Given I am enrolled in a degree
    And I am enrolled in a course with no prerequisites
    And there is a course in my degree that depends on the course I just completed
    When I complete all levels of the prerequisite course
    Then I am automatically enrolled in the dependent course

  Scenario: Multiple degree enrollments are checked on course completion
    Given I am enrolled in multiple degrees
    And I complete a course that is a prerequisite for courses in both degrees
    Then I am automatically enrolled in the newly available courses for both degrees

  ## Final Grade section

  Scenario: Final Grade card is displayed
    Given I navigate to a degree detail page
    Then I see a "Final Grade" card
    And the card shows the overall progress percentage
    And the card shows a letter grade
    And the card has a progress bar

  Scenario Outline: Letter grade matches progress percentage
    Given I am enrolled in a degree title with "<progress>" overall progress
    When I view the Final Grade section
    Then I see the letter grade "<grade>" displayed with "<color>" color

    Examples:
      | progress | grade | color      |
      | 0        | F     | red        |
      | 50       | F     | red        |
      | 60       | C     | yellow     |
      | 70       | B     | blue       |
      | 80       | A     | green      |
      | 90       | A+    | emerald    |
      | 100      | A+    | emerald    |

  Scenario: Final Grade card shows motivational text
    Given I navigate to a degree detail page
    Then I see the text "Complete all classes at your target level to earn your grade"

  ## Final Exam section

  Scenario: Final Exam section is displayed
    Given I navigate to a degree detail page
    Then I see a "Final Exam" section header
    And I see the degree subtitle describing the final exam requirements

  Scenario: Final Exam lists required activities
    Given I navigate to a degree detail page with final exam activities
    Then I see a list of final exam activities
    And each activity shows its title and description

  Scenario: Final Exam activities show completion status
    Given I am enrolled in a degree title with final exam activities
    And some exam activities are completed
    When I view the Final Exam section
    Then completed exam activities show a check mark indicator
    And incomplete exam activities show an empty indicator

  Scenario: Final Exam shows overall completion progress
    Given I am enrolled in a degree title with final exam activities
    When I view the Final Exam section
    Then I see the number of completed activities out of total
    And I see a progress bar reflecting exam completion

  Scenario: Final Exam is only visible when enrolled
    Given I navigate to a degree detail page
    And I am not enrolled in the degree
    Then the Final Exam section is hidden or shows a prompt to enroll first

  ## Loading state

  Scenario: Loading spinner is shown while degree data loads
    Given I navigate to a degree detail page
    Then I see a loading spinner before the content appears
