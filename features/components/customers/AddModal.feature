Feature: Add Modal

  Modal dialog for adding new items.

  Scenario: Open add modal
    Given I am on a page with add functionality
    When I click the add button
    Then a modal dialog opens with an input form
