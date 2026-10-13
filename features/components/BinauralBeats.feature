Feature: Binaural Beats

  Plays binaural beat audio tracks for focus and relaxation during study sessions.

  Scenario: Play binaural beats
    Given I have binaural beats enabled
    When I start a study session
    Then the selected binaural beat audio plays
