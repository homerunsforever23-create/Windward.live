/* ═══════════════════════════════════════════════════════════
   WINDWARD — PRIVILEGED VIEW MARKUP
   These screens are NOT in index.html. They are injected into
   their empty containers only after Supabase confirms a session.
   A signed-out visitor toggling display:none in devtools finds
   three empty divs.
═══════════════════════════════════════════════════════════ */
(function () {
  var mounted = { portal: false, admin: false, employee: false };

  var MARKUP = {
    portal: `    <div class="portal-wrap">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sb-logo"><svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="16" fill="#0b1f3a"/><text x="50" y="52" font-family="Georgia,serif" font-size="52" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">W</text><clipPath id="wlogoS"><rect width="100" height="100" rx="16"/></clipPath><g clip-path="url(#wlogoS)"><path d="M-10 68 Q15 50 40 68 Q65 86 90 68 Q115 50 140 68 L140 110 L-10 110Z" fill="#1a4a7a"/><path d="M-10 76 Q15 58 40 76 Q65 94 90 76 Q115 58 140 76 L140 110 L-10 110Z" fill="#2563a8"/><path d="M-10 84 Q15 66 40 84 Q65 102 90 84 Q115 66 140 84 L140 110 L-10 110Z" fill="#3b82c4"/><path d="M-10 92 Q15 74 40 92 Q65 110 90 92 Q115 74 140 92 L140 110 L-10 110Z" fill="#5b9fd4"/><path d="M-10 68 Q15 50 40 68 Q65 86 90 68 Q115 50 140 68" fill="none" stroke="#2563a8" stroke-width="1.5" stroke-linecap="round"/><path d="M-10 76 Q15 58 40 76 Q65 94 90 76 Q115 58 140 76" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round"/><path d="M-10 84 Q15 66 40 84 Q65 102 90 84 Q115 66 140 84" fill="none" stroke="#bfdbfe" stroke-width="1.5" stroke-linecap="round"/><path d="M-10 92 Q15 74 40 92 Q65 110 90 92 Q115 74 140 92" fill="none" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round"/></g></svg><span>Windward</span></div>
        <div class="sb-user">
          <div class="sb-avatar">JD</div>
          <div class="sb-name">Jane Doe</div>
          <div class="sb-unit">Carriage House · Unit 2A</div>
        </div>
        <nav class="sb-nav">
          <div class="sb-section-label">Main</div>
          <div class="sb-link active" onclick="showPPage('dashboard',this)"><span class="sb-icon">🏠</span> Dashboard</div>
          <div class="sb-link" onclick="showPPage('payments',this)"><span class="sb-icon">💳</span> Payments</div>
          <div class="sb-link" onclick="showPPage('maintenance',this)"><span class="sb-icon">🔧</span> Maintenance <span class="sb-badge" id="maintBadge" style="display:none;">0</span></div>
          <div class="sb-link" onclick="showPPage('documents',this)"><span class="sb-icon">📄</span> Documents <span class="sb-badge" id="docBadge" style="display:none;">0</span></div>
          <div class="sb-section-label">Account</div>
          <div class="sb-link" onclick="showPPage('profile',this)"><span class="sb-icon">👤</span> My Profile</div>
        </nav>
        <div class="sb-bottom">
          <div class="sb-logout" onclick="doLogout()"><span>↩</span> Sign Out</div>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">

        <!-- DASHBOARD -->
        <div class="ppage active" id="ppage-dashboard">
          <div class="page-header"><div class="page-title" id="dash-greeting">Welcome 👋</div><div class="page-sub" id="dash-sub">Here's what's happening with your home.</div></div>
          <div class="notice-card" id="dashNotice" style="margin-bottom:1.4rem;display:none;">
            <span style="font-size:1.2rem;">📋</span>
            <p><strong>Action required:</strong> You have a document waiting for your signature.</p>
          </div>
          <div class="dash-stats">
            <div class="stat-card blue"><div class="stat-icon">💰</div><div class="stat-val" id="stat-rent">—</div><div class="stat-lbl">Monthly Rent</div><span class="chip chip-yellow" style="margin-top:0.5rem;">Due 1st of month</span></div>
            <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-val">Current</div><div class="stat-lbl">Account Status</div><span class="chip chip-green" style="margin-top:0.5rem;">No Balance</span></div>
            <div class="stat-card orange"><div class="stat-icon">🔧</div><div class="stat-val" id="stat-maint">0</div><div class="stat-lbl">Open Requests</div><span class="chip chip-blue" style="margin-top:0.5rem;">Maintenance</span></div>
          </div>
          <div class="dash-grid">
            <div class="dash-col">
              <div class="pcard">
                <div class="pcard-title"><span>💳</span> Next Payment</div>
                <div class="rent-banner">
                  <div class="rb-label">Rent Due</div>
                  <div class="rb-amount" id="dash-rent-amount">—</div>
                  <div class="rb-due" id="dash-rent-due">Loading your unit info...</div>
                  <button class="pay-now-btn" onclick="showPPage('payments', document.querySelector('.sb-link:nth-child(3)'))">Pay Now →</button>
                </div>
              </div>
              <div class="pcard">
                <div class="pcard-title"><span>📋</span> Recent Activity</div>
                <div class="activity-list" id="dash-activity">
                  <div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">📭</div>
                    No activity yet — payments and requests will appear here.
                  </div>
                </div>
              </div>
            </div>
            <div class="dash-col">
              <div class="pcard">
                <div class="pcard-title"><span>📄</span> Documents Awaiting Signature</div>
                <div id="dash-docs">
                  <div style="text-align:center;padding:1.5rem;color:var(--muted);font-size:0.85rem;">
                    <div style="font-size:1.8rem;margin-bottom:0.5rem;">✅</div>
                    No documents pending signature.
                  </div>
                </div>
              </div>
              <div class="pcard">
                <div class="pcard-title"><span>🏠</span> My Unit</div>
                <div style="display:flex;flex-direction:column;gap:0;">
                  <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);"><span style="font-size:0.8rem;color:var(--muted);font-weight:600;">Property</span><span style="font-size:0.82rem;font-weight:800;color:var(--navy);" id="unit-property">—</span></div>
                  <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);"><span style="font-size:0.8rem;color:var(--muted);font-weight:600;">Unit</span><span style="font-size:0.82rem;font-weight:800;color:var(--navy);" id="unit-number">—</span></div>
                  <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);"><span style="font-size:0.8rem;color:var(--muted);font-weight:600;">Lease Start</span><span style="font-size:0.82rem;font-weight:800;color:var(--navy);" id="unit-lease-start">—</span></div>
                  <div style="display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border);"><span style="font-size:0.8rem;color:var(--muted);font-weight:600;">Lease End</span><span style="font-size:0.82rem;font-weight:800;color:var(--warning);" id="unit-lease-end">—</span></div>
                  <div style="display:flex;justify-content:space-between;padding:0.5rem 0;"><span style="font-size:0.8rem;color:var(--muted);font-weight:600;">Monthly Rent</span><span style="font-size:0.82rem;font-weight:800;color:var(--navy);" id="unit-rent">—</span></div>
                </div>
              </div>
              <div class="pcard">
                <div class="pcard-title"><span>📞</span> Need Help?</div>
                <p style="font-size:0.83rem;color:var(--muted);line-height:1.6;margin-bottom:0.9rem;">Our team is available Mon–Fri 9am–5pm and Sat 10am–3pm. Emergencies? Call anytime.</p>
                <a href="tel:7324924201" style="display:flex;align-items:center;gap:0.6rem;font-size:0.85rem;font-weight:700;color:var(--mid);text-decoration:none;margin-bottom:0.4rem;">📞 (732) 492-4201</a>
                <a href="mailto:contact.windward.live@gmail.com" style="display:flex;align-items:center;gap:0.6rem;font-size:0.85rem;font-weight:700;color:var(--mid);text-decoration:none;">✉️ contact.windward.live@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <!-- PAYMENTS -->
        <div class="ppage" id="ppage-payments">
          <div class="page-header"><div class="page-title">Payments</div><div class="page-sub">Pay rent, fees, and view your payment history.</div></div>
          <div class="ptabs">
            <div class="ptab active" onclick="switchPTab('card',this)">💳 Credit / Debit</div>
            <div class="ptab" onclick="switchPTab('ach',this)">🏦 Bank (ACH)</div>
            <div class="ptab" onclick="switchPTab('digital',this)">📱 Venmo / PayPal</div>
          </div>
          <!-- CARD -->
          <div class="ppanel active" id="ppanel-card">
            <div class="pay-form-wrap">
              <div class="pfh" id="pfh-card"><div><h3>Make a Payment</h3><p>Windward Properties · Resident Portal</p></div><div class="secure-pill">🔒 SSL Secured</div></div>
              <div class="pfb" id="pfb-card">
                <div class="card-brands"><div class="cbrand visa">VISA</div><div class="cbrand mc">MC</div><div class="cbrand amex">AMEX</div><div class="cbrand disc">DISC</div></div>
                <div class="fg-row2">
                  <div class="fg"><label>Payment Type</label><select id="card-pay-type" onchange="updatePayAmt()"><option value="rent">Monthly Rent</option><option value="100">Late Fee — $100</option><option value="500">Security Deposit — $500</option></select></div>
                  <div class="fg"><label>Pay Period</label><select id="card-pay-period"></select></div>
                </div>
                <div class="amt-box"><span class="amt-lbl">Amount</span><span class="amt-val" id="cardAmt">—</span></div>
                <div class="fg">
                  <label>Card Details</label>
                  <div id="stripe-card-element" style="padding:0.78rem 1rem;border:1.5px solid #e2e8f0;border-radius:9px;background:white;"></div>
                  <div id="stripe-card-errors" style="color:#ef4444;font-size:0.78rem;margin-top:0.4rem;"></div>
                </div>
                <button class="submit-btn" id="stripe-pay-btn" onclick="submitStripePayment()">Pay $<span id="payCardBtn">—</span> Securely →</button>
              </div>
              <div style="display:none;padding:2.5rem;text-align:center;" id="psucc-card">
                <div class="success-circle">✅</div><h3 class="success-h3">Payment Received!</h3>
                <p style="color:var(--muted);">Your payment has been processed. A receipt has been sent to your email.</p>
                <button class="reset-btn" onclick="resetPay('card')">Make Another Payment</button>
              </div>
              <div class="pff" id="pff-card">🔒 <span>SSL Encrypted</span> · Powered by Stripe · PCI DSS Compliant</div>
            </div>
          </div>
          <!-- ACH -->
          <div class="ppanel" id="ppanel-ach">
            <div class="pay-form-wrap">
              <div class="pfh"><div><h3>Bank Transfer (ACH)</h3><p>Lower fees · 1–3 business days</p></div><div class="secure-pill">🔒 SSL Secured</div></div>
              <div class="pfb" id="pfb-ach">
                <div class="fg-row2"><div class="fg"><label>Payment Type</label><select id="ach-pay-type"><option value="rent">Monthly Rent</option><option value="100">Late Fee — $100</option></select></div><div class="fg"><label>Pay Period</label><select id="ach-pay-period"></select></div></div>
                <div class="fg"><label>Account Holder Name</label><input type="text" id="ach-name" placeholder="Your name"></div>
                <div class="fg"><label>Routing Number (9 digits)</label><input type="text" placeholder="021000021" maxlength="9"></div>
                <div class="fg"><label>Account Number</label><input type="text" placeholder="Your account number"></div>
                <div class="fg"><label>Account Type</label><select><option>Checking</option><option>Savings</option></select></div>
                <div class="amt-box"><span class="amt-lbl">Amount (ACH — lower fees)</span><span class="amt-val" id="achAmt">—</span></div>
                <button class="submit-btn" onclick="submitPay('ach')">Submit Bank Payment →</button>
              </div>
              <div style="display:none;padding:2.5rem;text-align:center;" id="psucc-ach">
                <div class="success-circle">🏦</div><h3 class="success-h3">Transfer Initiated!</h3>
                <p style="color:var(--muted);">Your ACH transfer has been submitted. Settles within 1–3 business days.</p>
                <button class="reset-btn" onclick="resetPay('ach')">Make Another Payment</button>
              </div>
              <div class="pff">🔒 <span>SSL Encrypted</span> · Powered by Stripe · PCI DSS Compliant</div>
            </div>
          </div>
          <!-- DIGITAL -->
          <div class="ppanel" id="ppanel-digital">
            <div class="pay-form-wrap" style="max-width:460px;">
              <div class="pfh"><div><h3>Venmo / PayPal</h3><p>Quick payment via your preferred app</p></div><div class="secure-pill">🔒 Secure</div></div>
              <div class="pfb" id="pfb-digital">
                <div class="fg"><label>Payment Type</label><select><option value="rent">Monthly Rent</option><option value="100">Late Fee — $100</option></select></div>
                <div class="fg"><label>Your Email (for receipt)</label><input type="email" id="digital-email" placeholder="your@email.com"></div>
                <div class="amt-box"><span class="amt-lbl">Amount</span><span class="amt-val" id="digitalAmt">—</span></div>
                <button class="venmo-btn" onclick="submitPay('digital')"><strong style="font-size:1.1rem">V</strong> Pay with Venmo</button>
                <div class="pay-or">or</div>
                <button class="paypal-btn" onclick="submitPay('digital')"><span style="font-weight:900">Pay</span><span style="color:#009cde;font-weight:900">Pal</span></button>
              </div>
              <div style="display:none;padding:2.5rem;text-align:center;" id="psucc-digital">
                <div class="success-circle">📱</div><h3 class="success-h3">Redirecting…</h3>
                <p style="color:var(--muted);">You're being redirected to complete your payment. A receipt will be emailed to you.</p>
                <button class="reset-btn" onclick="resetPay('digital')">Back to Payments</button>
              </div>
              <div class="pff">🔒 <span>Secure</span> · PayPal & Venmo Protected</div>
            </div>
          </div>
          <!-- HISTORY -->
          <div class="pcard" style="margin-top:2rem;">
            <div class="pcard-title"><span>🧾</span> Payment History</div>
            <table class="pay-hist-table">
              <thead><tr><th>Date</th><th>Description</th><th>Method</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody id="pay-hist-body">
                <tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">
                  <div style="font-size:1.8rem;margin-bottom:0.5rem;">📭</div>
                  No payment history yet. Payments will appear here after your first transaction.
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- MAINTENANCE -->
        <div class="ppage" id="ppage-maintenance">
          <div class="page-header"><div class="page-title">Maintenance Requests</div><div class="page-sub">Submit a new request or check the status of existing ones.</div></div>
          <div class="maint-grid">
            <div class="pcard">
              <div class="pcard-title"><span>➕</span> New Request</div>
              <div class="maint-success" id="maintSuccess"><span style="font-size:1.4rem">✅</span><div><div style="font-size:0.88rem;font-weight:800;color:#065f46;">Request Submitted!</div><div style="font-size:0.78rem;color:#047857;">Our team will be in touch within 24 hours.</div></div></div>
              <div class="fg"><label>Category</label><select><option>Plumbing</option><option>Electrical</option><option>HVAC / Heating</option><option>Appliances</option><option>Doors / Windows</option><option>Pest Control</option><option>Other</option></select></div>
              <div class="fg"><label>Issue Title</label><input type="text" placeholder="e.g. Leaky faucet in bathroom"></div>
              <div class="fg"><label>Description</label><textarea style="width:100%;padding:0.78rem 1rem;border:1.5px solid var(--border);border-radius:9px;font-family:'Nunito',sans-serif;font-size:0.92rem;color:var(--text);outline:none;resize:vertical;min-height:90px;transition:border-color 0.2s;" placeholder="Describe the issue in detail…"></textarea></div>
              <div class="fg"><label>Priority Level</label>
                <div class="priority-btns">
                  <button class="priority-btn pri-low" onclick="selectPri(this)">🟢 Low</button>
                  <button class="priority-btn pri-med selected" onclick="selectPri(this)">🟡 Medium</button>
                  <button class="priority-btn pri-high" onclick="selectPri(this)">🔴 High</button>
                  <button class="priority-btn pri-emer" onclick="selectPri(this)">🚨 Emergency</button>
                </div>
              </div>
              <div class="fg"><label>Entry Permission</label><select><option>Yes — may enter when I'm not home</option><option>No — I must be present</option><option>Call me first to schedule</option></select></div>
              <div class="fg"><label>Photos (optional)</label>
                <div class="photo-drop" onclick="this.querySelector('input').click()"><div style="font-size:2rem">📷</div><strong>Click to upload photos</strong><p>PNG, JPG up to 10MB</p><input type="file" multiple accept="image/*" style="display:none"></div>
              </div>
              <button class="submit-btn" onclick="submitMaint()">Submit Request</button>
            </div>
            <div id="maint-requests-list">
              <div class="pcard-title" style="margin-bottom:1rem;"><span>📋</span> Your Requests</div>
              <div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">🔧</div>
                No active requests. Submit one using the form.
              </div>
            </div>
          </div>
        </div>

        <!-- DOCUMENTS -->
        <div class="ppage" id="ppage-documents">
          <div class="page-header"><div class="page-title">Documents</div><div class="page-sub">View, download, and sign your lease documents via DocuSign.</div></div>
          <div class="doc-tabs">
            <div class="doc-tab active" onclick="switchDocTab('pending',this)">✍️ Awaiting Signature <span id="pendingBadgeTab" style="background:#ef4444;color:white;font-size:0.65rem;font-weight:800;padding:0.15rem 0.5rem;border-radius:999px;margin-left:0.4rem;display:none;">0</span></div>
            <div class="doc-tab" onclick="switchDocTab('signed',this)">✅ Signed</div>
            <div class="doc-tab" onclick="switchDocTab('all',this)">📁 All Documents</div>
          </div>
          <div class="doc-panel active" id="docpanel-pending">
            <div class="doc-list" id="docs-pending-list">
              <div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">✅</div>
                No documents pending signature.
              </div>
            </div>
          </div>
          <div class="doc-panel" id="docpanel-signed">
            <div class="doc-list" id="docs-signed-list">
              <div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">📁</div>
                No signed documents yet.
              </div>
            </div>
          </div>
          <div class="doc-panel" id="docpanel-all">
            <div class="doc-list" id="docs-all-list">
              <div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;">
                <div style="font-size:2rem;margin-bottom:0.5rem;">📁</div>
                No documents yet.
              </div>
            </div>
          </div>
          <div class="pcard" style="margin-top:2rem;"><div class="pcard-title"><span>ℹ️</span> About DocuSign</div><p style="font-size:0.85rem;color:var(--muted);line-height:1.7;">Windward Properties uses <strong style="color:var(--navy);">DocuSign</strong> to send and collect legally binding electronic signatures. All signed documents are timestamped, encrypted, and stored securely. You receive a copy of every signed document automatically.</p></div>
        </div>

        <!-- PROFILE -->
        <div class="ppage" id="ppage-profile">
          <div class="page-header"><div class="page-title">My Profile</div><div class="page-sub">Update your contact information and preferences.</div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;align-items:start;">
            <div class="pcard">
              <div class="pcard-title"><span>👤</span> Personal Information</div>
              <div class="fg-row2"><div class="fg"><label>First Name</label><input type="text" id="profile-fname" placeholder="First name"></div><div class="fg"><label>Last Name</label><input type="text" id="profile-lname" placeholder="Last name"></div></div>
              <div class="fg"><label>Email Address</label><input type="email" value="jane@email.com"></div>
              <div class="fg"><label>Phone Number</label><input type="tel" value="(610) 555-0199"></div>
              <div class="fg"><label>Emergency Contact</label><input type="text" placeholder="Name and phone number"></div>
              <button class="submit-btn" onclick="this.textContent='✓ Saved!';setTimeout(()=>this.textContent='Save Changes',2000)">Save Changes</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:1.2rem;">
              <div class="pcard">
                <div class="pcard-title"><span>🔒</span> Change Password</div>
                <div class="fg"><label>Current Password</label><input type="password" placeholder="••••••••"></div>
                <div class="fg"><label>New Password</label><input type="password" placeholder="••••••••"></div>
                <div class="fg"><label>Confirm New Password</label><input type="password" placeholder="••••••••"></div>
                <button class="submit-btn" onclick="this.textContent='✓ Updated!';setTimeout(()=>this.textContent='Update Password',2000)">Update Password</button>
              </div>
              <div class="pcard">
                <div class="pcard-title"><span>🔔</span> Notifications</div>
                <div style="display:flex;flex-direction:column;gap:0.8rem;">
                  <label style="display:flex;align-items:center;gap:0.7rem;cursor:pointer;font-size:0.86rem;font-weight:600;"><input type="checkbox" checked style="accent-color:var(--mid);width:16px;height:16px;"> Rent due reminders</label>
                  <label style="display:flex;align-items:center;gap:0.7rem;cursor:pointer;font-size:0.86rem;font-weight:600;"><input type="checkbox" checked style="accent-color:var(--mid);width:16px;height:16px;"> Maintenance updates</label>
                  <label style="display:flex;align-items:center;gap:0.7rem;cursor:pointer;font-size:0.86rem;font-weight:600;"><input type="checkbox" checked style="accent-color:var(--mid);width:16px;height:16px;"> Document signature requests</label>
                  <label style="display:flex;align-items:center;gap:0.7rem;cursor:pointer;font-size:0.86rem;font-weight:600;"><input type="checkbox" checked style="accent-color:var(--mid);width:16px;height:16px;"> Payment confirmations</label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>`,
    admin: `  <div style="display:flex;min-height:100vh;">

    <!-- ADMIN SIDEBAR -->
    <aside style="width:240px;flex-shrink:0;background:var(--navy);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;">
      <div style="padding:1.4rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:0.6rem;">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#f59e0b,#ef4444);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;">🏠</div>
        <span style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:white;">Admin</span>
      </div>
      <div style="padding:1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.8rem;font-weight:700;color:white;">Windward Properties</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">Landlord Dashboard</div>
      </div>
      <nav style="flex:1;padding:1rem 0;">
        <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:0.8rem 1.5rem 0.4rem;">Management</div>
        <div class="admin-nav-link active" id="anl-overview" onclick="showAdminPage('overview',this)">📊 Overview</div>
        <div class="admin-nav-link" id="anl-tenants" onclick="showAdminPage('tenants',this)">👥 Tenants</div>
        <div class="admin-nav-link" id="anl-payments" onclick="showAdminPage('payments',this)">💰 Payments</div>
        <div class="admin-nav-link" id="anl-maintenance" onclick="showAdminPage('maintenance',this)">🔧 Maintenance</div>
        <div class="admin-nav-link" id="anl-properties" onclick="showAdminPage('properties',this)">🏢 Properties</div>
      </nav>
      <div style="padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.06);">
        <div onclick="doAdminLogout()" style="display:flex;align-items:center;gap:0.6rem;font-size:0.82rem;color:rgba(255,255,255,0.35);cursor:pointer;padding:0.5rem 0;transition:color 0.2s;font-weight:600;">
          <span>↩</span> Sign Out
        </div>
      </div>
    </aside>

    <!-- ADMIN MAIN CONTENT -->
    <main style="flex:1;overflow-y:auto;padding:2.2rem 2.4rem;background:var(--pale);">

      <!-- OVERVIEW PAGE -->
      <div class="admin-page active" id="apage-overview">
        <div style="margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);" id="admin-greeting">Good morning, Daniel 👋</div>
            <div style="font-size:0.88rem;color:var(--muted);">Here's an overview of all your properties.</div>
          </div>
          <button onclick="previewEmployeeView()" style="background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;padding:0.6rem 1.2rem;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;display:flex;align-items:center;gap:0.5rem;">👷 Preview Employee View</button>
        </div>

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1.2rem;margin-bottom:1.8rem;">
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">👥</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="admin-stat-tenants">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Active Tenants</div>
          </div>
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">💰</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="admin-stat-revenue">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Monthly Revenue</div>
          </div>
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">🔧</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="admin-stat-maint">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Open Requests</div>
          </div>
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">🏢</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="admin-stat-units">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Occupied Units</div>
          </div>
        </div>

        <!-- Recent maintenance -->
        <div class="pcard">
          <div class="pcard-title"><span>🔧</span> Recent Maintenance Requests</div>
          <div id="admin-recent-maint">
            <div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">Loading...</div>
          </div>
        </div>
      </div>

      <!-- TENANTS PAGE -->
      <div class="admin-page" id="apage-tenants">
        <div style="margin-bottom:2rem;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Tenants</div>
            <div style="font-size:0.88rem;color:var(--muted);">All active tenants across your properties.</div>
          </div>
        </div>
        <div class="pcard">
          <table class="pay-hist-table" id="admin-tenants-table">
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Unit</th>
                <th>Rent</th>
                <th>Lease End</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="admin-tenants-body">
              <tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted);">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYMENTS PAGE -->
      <div class="admin-page" id="apage-payments">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Payments</div>
          <div style="font-size:0.88rem;color:var(--muted);">All payments across all tenants.</div>
        </div>
        <div class="pcard">
          <table class="pay-hist-table">
            <thead>
              <tr><th>Date</th><th>Tenant</th><th>Amount</th><th>Method</th><th>Status</th></tr>
            </thead>
            <tbody id="admin-payments-body">
              <tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MAINTENANCE PAGE -->
      <div class="admin-page" id="apage-maintenance">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Maintenance Requests</div>
          <div style="font-size:0.88rem;color:var(--muted);">Manage all open and pending requests.</div>
        </div>
        <div id="admin-maint-list" class="pcard">
          <div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div>
        </div>
      </div>

      <!-- PROPERTIES PAGE -->
      <div class="admin-page" id="apage-properties">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Properties</div>
          <div style="font-size:0.88rem;color:var(--muted);">Overview of all your properties and units.</div>
        </div>
        <div id="admin-properties-list">
          <div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div>
        </div>
      </div>

    </main>
  </div>`,
    employee: `  <div style="display:flex;min-height:100vh;">

    <!-- SIDEBAR -->
    <aside style="width:240px;flex-shrink:0;background:var(--navy);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;">
      <div style="padding:1.4rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;align-items:center;gap:0.6rem;">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#10b981,#059669);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem;">👷</div>
        <span style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:white;">Staff</span>
      </div>
      <div style="padding:1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.06);">
        <div style="font-size:0.8rem;font-weight:700;color:white;">Windward Properties</div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">Employee Portal</div>
      </div>
      <nav style="flex:1;padding:1rem 0;">
        <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:0.8rem 1.5rem 0.4rem;">Management</div>
        <div class="admin-nav-link active" id="enl-overview" onclick="showEmployeePage('overview',this)">📊 Overview</div>
        <div class="admin-nav-link" id="enl-tenants" onclick="showEmployeePage('tenants',this)">👥 Tenants</div>
        <div class="admin-nav-link" id="enl-maintenance" onclick="showEmployeePage('maintenance',this)">🔧 Maintenance</div>
        <div class="admin-nav-link" id="enl-properties" onclick="showEmployeePage('properties',this)">🏢 Properties</div>
        <div class="admin-nav-link" id="enl-leads" onclick="showEmployeePage('leads',this)">📬 Leads <span class="sb-badge" id="leadsBadge" style="display:none;">0</span></div>
      </nav>
      <div style="padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.06);">
        <div onclick="doEmployeeLogout()" style="display:flex;align-items:center;gap:0.6rem;font-size:0.82rem;color:rgba(255,255,255,0.35);cursor:pointer;padding:0.5rem 0;font-weight:600;" id="emp-signout-btn">
          <span>↩</span> <span id="emp-signout-label">Sign Out</span>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main style="flex:1;overflow-y:auto;padding:2.2rem 2.4rem;background:var(--pale);">

      <!-- OVERVIEW -->
      <div class="admin-page active" id="epage-overview">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);" id="employee-greeting">Good morning 👋</div>
          <div style="font-size:0.88rem;color:var(--muted);">Here's a summary of active items.</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-bottom:1.8rem;">
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">👥</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="emp-stat-tenants">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Active Tenants</div>
          </div>
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">🔧</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="emp-stat-maint">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Open Requests</div>
          </div>
          <div class="pcard" style="text-align:center;">
            <div style="font-size:1.8rem;margin-bottom:0.4rem;">🏢</div>
            <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--navy);" id="emp-stat-units">—</div>
            <div style="font-size:0.78rem;color:var(--muted);font-weight:600;">Occupied Units</div>
          </div>
        </div>
        <div class="pcard">
          <div class="pcard-title"><span>🔧</span> Recent Maintenance Requests</div>
          <div id="emp-recent-maint"><div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div></div>
        </div>
      </div>

      <!-- TENANTS -->
      <div class="admin-page" id="epage-tenants">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Tenants</div>
          <div style="font-size:0.88rem;color:var(--muted);">All active tenants across your properties.</div>
        </div>
        <div class="pcard">
          <table class="pay-hist-table">
            <thead><tr><th>Tenant</th><th>Phone</th><th>Property</th><th>Unit</th><th>Rent</th><th>Lease End</th><th>This Month</th><th>Action</th></tr></thead>
            <tbody id="emp-tenants-body"><tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted);">Loading...</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- MAINTENANCE -->
      <div class="admin-page" id="epage-maintenance">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Maintenance Requests</div>
          <div style="font-size:0.88rem;color:var(--muted);">Manage all open and pending requests.</div>
        </div>
        <div id="emp-maint-list" class="pcard"><div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div></div>
      </div>

      <!-- PROPERTIES -->
      <div class="admin-page" id="epage-properties">
        <div style="margin-bottom:2rem;">
          <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Properties</div>
          <div style="font-size:0.88rem;color:var(--muted);">Overview of all properties and units.</div>
        </div>
        <div id="emp-properties-list"><div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div></div>
      </div>

      <!-- LEADS -->
      <div class="admin-page" id="epage-leads">
        <div style="margin-bottom:2rem;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.9rem;font-weight:700;color:var(--navy);">Leads &amp; Inquiries</div>
            <div style="font-size:0.88rem;color:var(--muted);">Everyone who has submitted the contact form on windward.live.</div>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button onclick="filterLeads('all',this)" class="lead-filter active" style="padding:0.5rem 1rem;border-radius:999px;font-size:0.78rem;font-weight:700;border:2px solid var(--mid);background:var(--mid);color:white;cursor:pointer;font-family:'Nunito',sans-serif;">All</button>
            <button onclick="filterLeads('new',this)" class="lead-filter" style="padding:0.5rem 1rem;border-radius:999px;font-size:0.78rem;font-weight:700;border:2px solid var(--border);background:white;color:var(--slate);cursor:pointer;font-family:'Nunito',sans-serif;">New</button>
            <button onclick="filterLeads('contacted',this)" class="lead-filter" style="padding:0.5rem 1rem;border-radius:999px;font-size:0.78rem;font-weight:700;border:2px solid var(--border);background:white;color:var(--slate);cursor:pointer;font-family:'Nunito',sans-serif;">Contacted</button>
          </div>
        </div>
        <div id="emp-leads-list"><div style="text-align:center;padding:2rem;color:var(--muted);">Loading...</div></div>
      </div>

    </main>
  </div>`
  };

  function mount(key, containerId) {
    if (mounted[key]) return true;
    var el = document.getElementById(containerId);
    if (!el) return false;
    el.innerHTML = MARKUP[key];
    mounted[key] = true;
    return true;
  }

  // Each returns true once its screen is in the DOM and ready to populate.
  window.mountPortalDashboard = function () { return mount('portal', 'portal-dashboard'); };
  window.mountAdminDashboard  = function () { return mount('admin',  'view-admin'); };
  window.mountEmployeePortal  = function () { return mount('employee','view-employee'); };

  // Wipe privileged markup back out of the DOM on sign-out.
  window.unmountPrivilegedViews = function () {
    ['portal-dashboard', 'view-admin', 'view-employee'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
    mounted = { portal: false, admin: false, employee: false };
  };
})();
