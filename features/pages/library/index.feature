Feature: Library

  Browse media content by type: videos, images, audio, and books.

  Scenario: Browse library by media type
    Given I am on the Library page
    Then I see navigation cards for Videos, Images, Audio, and Books
    And each card shows the item count

  Scenario: View recent media
    Given I am on the Library page
    Then I see a section of recent media items
    And each item shows its title, type, and author
