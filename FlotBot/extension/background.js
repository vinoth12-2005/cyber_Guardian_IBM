// FlotBot Browser Extension Background Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "flotbot-analyze-selection",
    title: "Analyze with FlotBot AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "flotbot-analyze-selection" && info.selectionText) {
    try {
      const response = await fetch("http://127.0.0.1:41738/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: info.selectionText })
      });
      const data = await response.json();
      console.log("[FlotBot Extension] Explanation response:", data);
    } catch (err) {
      console.error("[FlotBot Extension] Failed to reach FlotBot API:", err);
    }
  }
});
