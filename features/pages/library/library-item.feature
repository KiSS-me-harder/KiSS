Feature: Library Item

  View a single media item with full content and metadata.

  Scenario: View a media item
    Given I navigate to a library item detail page
    Then I see the full media content and metadata
