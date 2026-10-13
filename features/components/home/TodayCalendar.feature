Feature: Today Calendar

  Calendar view showing upcoming events and scheduled courses for today.

  Scenario: View today's calendar
    Given I am on the Dashboard
    When I open the Calendar tab
    Then I see a calendar view of today's events
