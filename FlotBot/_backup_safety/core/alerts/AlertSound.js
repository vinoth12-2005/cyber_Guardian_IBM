const { exec } = require("child_process");

/**
 * AlertSound
 * Handles playing warning/critical sounds on Windows using PowerShell.
 */
class AlertSound {

    constructor(enabled = true) {
        this.enabled = enabled;
    }

    /**
     * Play alert sound based on severity.
     */
    play(severity = "MEDIUM") {

        if (!this.enabled || process.platform !== "win32") return;

        let soundCommand = "";

        if (severity === "CRITICAL" || severity === "HIGH") {
            // Play critical system hand sound
            soundCommand = "[System.Media.SystemSounds]::Hand.Play();";
        } else {
            // Play standard asterisk beep sound
            soundCommand = "[System.Media.SystemSounds]::Asterisk.Play();";
        }

        exec(`powershell -NonInteractive -NoProfile -Command "${soundCommand}"`, (err) => {
            if (err) {
                console.error("[AlertSound] Failed to play alert sound:", err.message);
            }
        });

    }

}

module.exports = AlertSound;
