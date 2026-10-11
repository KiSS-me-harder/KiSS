Feature: Detention

  View assigned punishments and their requirements.

  Scenario: Browse punishments
    Given I am on the Detention page
    Then I see a list of available punishments

  Scenario: View punishment details
    Given I navigate to a punishment detail page
    Then I see the punishment description and requirements
