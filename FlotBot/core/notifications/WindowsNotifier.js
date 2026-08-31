const { exec } = require("child_process");

/**
 * WindowsNotifier
 * Triggers native Windows Toast Notifications using PowerShell's
 * BurntToast module or standard Balloon tips.
 */
class WindowsNotifier {

    constructor(enabled = true) {
        this.enabled = enabled;
    }

    /**
     * Display a system toast notification.
     */
    notify(title, message, severity = "MEDIUM") {

        if (!this.enabled || process.platform !== "win32") return;

        // Escape single quotes for PowerShell safety
        const safeTitle   = (title || "FlotBot Notification").replace(/'/g, "''");
        const safeMessage = (message || "").replace(/'/g, "''");

        // PowerShell script to launch a Balloon Tip/Notification without external dependencies
        const psScript = `
        [void] [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms');
        $objNotification = New-Object System.Windows.Forms.NotifyIcon;
        $objNotification.Icon = [System.Drawing.SystemIcons]::Shield;
        $objNotification.BalloonTipIcon = '${severity === 'CRITICAL' || severity === 'HIGH' ? 'Error' : 'Warning'}';
        $objNotification.BalloonTipText = '${safeMessage}';
        $objNotification.BalloonTipTitle = '${safeTitle}';
        $objNotification.Visible = $True;
        $objNotification.ShowBalloonTip(5000);
        `;

        // Run PowerShell command
        exec(`powershell -NonInteractive -NoProfile -Command "${psScript.trim().replace(/\n/g, ' ')}"`, (err) => {
            if (err) {
                console.error("[WindowsNotifier] Failed to fire notification:", err.message);
            }
        });

    }

}

module.exports = WindowsNotifier;
