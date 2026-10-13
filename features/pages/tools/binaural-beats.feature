Feature: Binaural Beats Creator

  Create and customize binaural beat audio tracks using a multi-band equalizer interface.

  Scenario: View Binaural Beats Creator
    Given I am on the Binaural Beats Creator page
    Then I see the multi-band equalizer interface
    And I see frequency band sliders
    And I see preset buttons below the sliders

  Scenario: Adjust volume of a frequency band
    Given I am on the Binaural Beats Creator page
    When I adjust the volume slider for a frequency band
    Then the volume level for that band changes

  Scenario: Adjust frequency of a frequency band
    Given I am on the Binaural Beats Creator page
    When I adjust the frequency slider for a frequency band
    Then the frequency value for that band changes

  Scenario: Apply a preset
    Given I am on the Binaural Beats Creator page
    When I click on a preset button
    Then the frequency bands update to match the preset configuration

  Scenario: Start binaural beats playback
    Given I am on the Binaural Beats Creator page
    When I start the binaural beats
    Then the binaural beat audio plays with the configured frequency bands

  Scenario: Stop binaural beats playback
    Given I am on the Binaural Beats Creator page
    And binaural beats are currently playing
    When I stop the binaural beats
    Then the audio stops playing

  Scenario: Use multiple presets
    Given I am on the Binaural Beats Creator page
    When I apply the Delta preset
    Then the frequency bands reflect the Delta sleep configuration
    When I apply the Alpha preset
    Then the frequency bands reflect the Alpha relaxation configuration
    When I apply the Beta preset
    Then the frequency bands reflect the Beta focus configuration

  Scenario: Open download dialog
    Given I am on the Binaural Beats Creator page
    When I click the download button
    Then I see a download dialog
    And I can enter the duration in minutes and seconds

  Scenario: Download binaural beats audio
    Given I am on the Binaural Beats Creator page
    When I click the download button
    And I enter a duration of 1 minute and 30 seconds
    And I confirm the download
    Then the audio is generated based on the current frequency bands
    And a WAV file is downloaded to my browser

  Scenario: Cancel download dialog
    Given I am on the Binaural Beats Creator page
    When I click the download button
    And I cancel the download
    Then the download dialog closes
    And no audio file is downloaded
