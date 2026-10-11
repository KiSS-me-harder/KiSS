Feature: Media Player Widget

  Embedded media player for playing videos, audio, and other media content.

  Scenario: Play media
    Given I am viewing a media item
    When I click play
    Then the media player widget plays the content
