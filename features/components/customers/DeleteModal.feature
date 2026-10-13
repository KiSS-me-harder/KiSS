Feature: Delete Modal

  Confirmation modal dialog for deleting items.

  Scenario: Open delete modal
    Given I am viewing an item that can be deleted
    When I click the delete button
    Then a confirmation modal asks me to confirm the deletion
