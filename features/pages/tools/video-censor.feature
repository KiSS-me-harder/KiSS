Feature: Video Censor

  Censor videos by blurring inappropriate content in real-time, either from local files or remote URLs.

  Scenario: View Video Censor tool
    Given I am on the Video Censor page
    Then I see controls to load a video
    And I can upload a video file from my device
    And I can enter a URL to a remote video

  Scenario: Load video from local file
    Given I am on the Video Censor page
    When I upload a video file
    Then the video loads and is ready for censorship

  Scenario: Load video from URL
    Given I am on the Video Censor page
    When I enter a valid video URL
    And I load the video
    Then the video loads and is ready for censorship

  Scenario: Apply blur censorship
    Given I am on the Video Censor page
    And a video is loaded
    When I enable blur censorship
    Then the video plays with blurred content

  Scenario: Adjust blur intensity
    Given I am on the Video Censor page
    And a video is loaded
    And blur censorship is enabled
    When I adjust the blur intensity
    Then the blur level changes accordingly

  Scenario: Disable blur censorship
    Given I am on the Video Censor page
    And a video is loaded
    And blur censorship is enabled
    When I disable blur censorship
    Then the video plays without blur

  Scenario: Video plays locally without uploading to server
    Given I am on the Video Censor page
    When I upload a video file
    Then the video is processed locally in my browser
    And the video file is not uploaded to any server
