document.getElementById("btnCheckUrl").addEventListener("click", async () => {
  const output = document.getElementById("output");
  output.textContent = "Analyzing URL...";

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].url) {
      output.textContent = "Could not retrieve active tab URL.";
      return;
    }

    const targetUrl = tabs[0].url;
    try {
      const res = await fetch("http://127.0.0.1:41738/api/analyze/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();

      output.innerHTML = `<strong>URL:</strong> ${data.url}\n` +
                         `<strong>Risk Level:</strong> <span class="badge ${data.riskLevel === 'LOW' ? 'badge-safe' : 'badge-danger'}">${data.riskLevel}</span>\n` +
                         `<strong>Confidence:</strong> ${data.confidence}%\n` +
                         `<strong>Recommendation:</strong> ${data.recommendation}`;
    } catch (err) {
      output.textContent = "Error connecting to local FlotBot API: " + err.message;
    }
  });
});
