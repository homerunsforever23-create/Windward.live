/* Windward Properties — main application
   Part of windward.live. Loaded by index.html. */

/* ═══════════════════════════════════
   VIEW TRANSITIONS
═══════════════════════════════════ */
const overlay = document.getElementById('transition-overlay');

function switchView(to) {
  overlay.classList.add('fade-in');
  setTimeout(() => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + to).classList.add('active');
    window.scrollTo(0, 0);
    overlay.classList.remove('fade-in');
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.classList.remove('fade-out'), 350);
  }, 300);
}

function goToPortal() {
  switchView('portal');
  document.getElementById('portal-login-screen').style.display = 'flex';
  document.getElementById('portal-setpassword-screen').style.display = 'none';
  document.getElementById('portal-forgot-screen').style.display = 'none';
  document.getElementById('portal-dashboard').classList.remove('show');
}

function backToSite() {
  switchView('public');
}

/* ═══════════════════════════════════
   PUBLIC SITE HELPERS
═══════════════════════════════════ */
function smoothScroll(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toggleMobileNav() {
  const el = document.getElementById('mobileNav');
  if (el) el.classList.toggle('show');
}
function closeMobileNav() {
  const el = document.getElementById('mobileNav');
  if (el) el.classList.remove('show');
}

/* ═══════════════════════════════════
   CONTACT FORM
═══════════════════════════════════ */
async function submitContactForm(btn) {
  const fname    = document.getElementById('cf-fname')?.value.trim();
  const lname    = document.getElementById('cf-lname')?.value.trim();
  const email    = document.getElementById('cf-email')?.value.trim();
  const phone    = document.getElementById('cf-phone')?.value.trim();
  const interest = document.getElementById('cf-interest')?.value;
  const message  = document.getElementById('cf-message')?.value.trim();

  if (!fname || !email || !message) {
    showToast('⚠️ Please fill in your name, email, and message.');
    return;
  }

  btn.textContent = 'Sending…';
  btn.disabled = true;

  try {
    const res = await fetch('https://ljlpnigkeiseehsfectn.supabase.co/functions/v1/send-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbHBuaWdrZWlzZWVoc2ZlY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzMyMzgsImV4cCI6MjA5Mzc0OTIzOH0.jGgYuUyTZ7X6tZhDbX2BEPt7pokUIq9el5N2GsYkjnU'
      },
      body: JSON.stringify({ fname, lname, email, phone, interest, message })
    });

    const result = await res.json();

    if (result.success) {
      // Save the lead so staff can see it in the portal
      try {
        await supabase.from('leads').insert({
          first_name: fname,
          last_name:  lname || '',
          email,
          phone:      phone || null,
          interest:   interest || null,
          message,
          status:     'new'
        });
      } catch (e) { console.error('Could not save lead:', e); }

      btn.textContent = '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg,#065f46,#10b981)';
      ['cf-fname','cf-lname','cf-email','cf-phone','cf-message'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const sel = document.getElementById('cf-interest');
      if (sel) sel.selectedIndex = 0;
      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    } else {
      throw new Error(result.error || 'Failed to send');
    }
  } catch (err) {
    console.error('Contact form error:', err);
    showToast('❌ Could not send message. Please email us directly.');
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    btn.disabled = false;
  }
}

/* ═══════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════
   NAV SCROLL EFFECT
═══════════════════════════════════ */
const publicNav = document.getElementById('public-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    publicNav.classList.add('scrolled');
  } else {
    publicNav.classList.remove('scrolled');
  }
}, { passive: true });

/* ═══════════════════════════════════
   STRIPE PAYMENTS
═══════════════════════════════════ */
let stripeCardElement = null;
let stripeElementsMounted = false;

function mountStripeElement() {
  if (stripeElementsMounted) return;
  if (!window.stripeClient) { setTimeout(mountStripeElement, 200); return; }
  const elements = window.stripeClient.elements();
  stripeCardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '15px',
        color: '#0b1f3a',
        '::placeholder': { color: '#94a3b8' }
      },
      invalid: { color: '#ef4444' }
    }
  });
  stripeCardElement.mount('#stripe-card-element');
  stripeCardElement.on('change', (e) => {
    const errEl = document.getElementById('stripe-card-errors');
    if (errEl) errEl.textContent = e.error ? e.error.message : '';
  });
  stripeElementsMounted = true;
}

async function submitStripePayment() {
  const btn   = document.getElementById('stripe-pay-btn');
  const errEl = document.getElementById('stripe-card-errors');

  if (!stripeCardElement) { showToast('⚠️ Card form not loaded. Please refresh.'); return; }

  const cardType = document.getElementById('card-pay-type');
  const period   = document.getElementById('card-pay-period');
  const amount   = parseFloat(cardType?.value) || window._tenantRent || 0;

  if (!amount) { showToast('⚠️ Could not determine payment amount.'); return; }

  btn.textContent = 'Processing…';
  btn.disabled = true;

  try {
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch('https://ljlpnigkeiseehsfectn.supabase.co/functions/v1/stripe-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action: 'create_payment_intent',
        amount,
        customer_email: window._tenantEmail || '',
        description: `Windward Properties — ${period?.options[period?.selectedIndex]?.text || 'Rent Payment'}`
      })
    });

    const { client_secret, error: intentError } = await res.json();
    if (intentError) throw new Error(intentError);

    const { paymentIntent, error: confirmError } = await window.stripeClient.confirmCardPayment(client_secret, {
      payment_method: { card: stripeCardElement }
    });

    if (confirmError) {
      if (errEl) errEl.textContent = confirmError.message;
      btn.textContent = `Pay $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} Securely →`;
      btn.disabled = false;
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      if (window._windwardTenantId) {
        await supabase.from('payments').insert({
          tenant_id:      window._windwardTenantId,
          amount,
          payment_method: 'card',
          payment_type:   'rent',
          status:         'paid',
          stripe_payment_intent_id: paymentIntent.id
        });
      }

      document.getElementById('pfb-card').style.display  = 'none';
      document.getElementById('psucc-card').style.display = 'block';
      document.getElementById('pff-card').style.display   = 'none';
      showToast('✅ Payment successful! Receipt sent to your email.');
      if (window._windwardTenantId) await loadPaymentHistory(window._windwardTenantId);
    }

  } catch (err) {
    console.error('Stripe error:', err);
    if (errEl) errEl.textContent = 'Payment failed. Please try again.';
    btn.textContent = `Pay $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} Securely →`;
    btn.disabled = false;
  }
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const err   = document.getElementById('loginError');
  const btn   = document.querySelector('#portal-login-screen .login-btn');

  if (!email || !pass) {
    err.textContent = 'Please enter your email and password.';
    err.classList.add('show');
    return;
  }

  btn.textContent = 'Signing in…';
  btn.disabled = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (error) {
      err.textContent = 'Invalid email or password. Please try again.';
      err.classList.add('show');
      btn.textContent = 'Sign In to Portal';
      btn.disabled = false;
      return;
    }

    err.classList.remove('show');

    if (isAdmin(data.user.email)) {
      document.getElementById('portal-login-screen').style.display = 'none';
      document.getElementById('portal-dashboard').classList.remove('show');
      mountAdminDashboard();
      switchView('admin');
      startAutoSignout();
      loadAdminOverview();
    } else if (isEmployee(data.user.email)) {
      document.getElementById('portal-login-screen').style.display = 'none';
      document.getElementById('portal-dashboard').classList.remove('show');
      mountEmployeePortal();
      switchView('employee');
      startAutoSignout();
      loadEmployeeOverview();
    } else {
      mountPortalDashboard();
      await loadTenantData(data.user);
      document.getElementById('portal-login-screen').style.display = 'none';
      document.getElementById('portal-dashboard').classList.add('show');
      startAutoSignout();
    }

  } catch (err) {
    console.error('Login error:', err);
    err.textContent = 'Something went wrong. Please try again.';
    err.classList.add('show');
  }

  btn.textContent = 'Sign In to Portal';
  btn.disabled = false;
}

async function loadTenantData(user) {
  const { data: tenant, error } = await supabase
    .from('tenants')
    .select(`*, units (unit_number, bedrooms, rent_amount, properties (name, address, city))`)
    .eq('user_id', user.id)
    .single();

  if (error || !tenant) { console.error('Could not load tenant data', error); return; }

  const unit      = tenant.units;
  const property  = unit?.properties;
  const fullName  = `${tenant.first_name} ${tenant.last_name}`;
  const initials  = `${tenant.first_name[0]}${tenant.last_name[0]}`.toUpperCase();
  const unitLabel = `${property?.name} · Unit ${unit?.unit_number}`;
  const rent      = parseFloat(tenant.rent_amount || unit?.rent_amount || 0);
  const rentFmt   = rent.toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dashTitle = document.getElementById('dash-greeting');
  const dashSub   = document.getElementById('dash-sub');
  if (dashTitle) dashTitle.textContent = `${greeting}, ${tenant.first_name} 👋`;
  if (dashSub)   dashSub.textContent   = `Here's what's happening with your home at ${property?.name}.`;

  // Sidebar
  document.querySelector('.sb-avatar').textContent = initials;
  document.querySelector('.sb-name').textContent   = fullName;
  document.querySelector('.sb-unit').textContent   = unitLabel;

  // Stat cards
  const statRent = document.getElementById('stat-rent');
  if (statRent) statRent.textContent = `$${rentFmt}`;

  // Rent banner
  const rentAmtEl = document.getElementById('dash-rent-amount');
  const rentDueEl = document.getElementById('dash-rent-due');
  if (rentAmtEl) rentAmtEl.textContent = `$${rentFmt}`;
  if (rentDueEl) rentDueEl.innerHTML   = `Unit ${unit?.unit_number} · <strong style="color:var(--warning);">${property?.name}</strong>`;

  // My Unit panel
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const leaseStart = tenant.lease_start ? new Date(tenant.lease_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const leaseEnd   = tenant.lease_end   ? new Date(tenant.lease_end).toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  setEl('unit-property',    `${property?.name} — ${property?.address}, ${property?.city}`);
  setEl('unit-number',      unit?.unit_number);
  setEl('unit-lease-start', leaseStart);
  setEl('unit-lease-end',   leaseEnd);
  setEl('unit-rent',        `$${rentFmt}`);

  // Profile page
  const fName  = document.getElementById('profile-fname');
  const lName  = document.getElementById('profile-lname');
  const pEmail = document.querySelector('#ppage-profile input[type="email"]');
  const pPhone = document.querySelector('#ppage-profile input[type="tel"]');
  if (fName)  fName.value  = tenant.first_name;
  if (lName)  lName.value  = tenant.last_name;
  if (pEmail) pEmail.value = tenant.email;
  if (pPhone) pPhone.value = tenant.phone || '';

  // DocuSign signature name
  const sigName = document.getElementById('sig-name-text');
  if (sigName) sigName.textContent = fullName;

  // Payment forms — set dynamic rent amount and prefill name/email
  window._tenantRent     = rent;
  window._tenantFullName = fullName;
  window._tenantEmail    = tenant.email;
  populatePaymentForms(rent, fullName, tenant.email);

  // Load maintenance, payments, documents
  await loadMaintenanceRequests(tenant.id);
  await loadPaymentHistory(tenant.id);
  await loadDocuments(tenant.id);

  window._windwardTenantId = tenant.id;
  window._windwardUnitId   = tenant.unit_id;
}

function populatePaymentForms(rent, name, email) {
  const rentFmt = rent.toLocaleString('en-US', { minimumFractionDigits: 2 });

  // Card form
  const cardType = document.getElementById('card-pay-type');
  if (cardType) {
    cardType.innerHTML = `<option value="${rent}">Monthly Rent — $${rentFmt}</option><option value="100">Late Fee — $100</option><option value="500">Security Deposit — $500</option>`;
  }
  const cardAmt = document.getElementById('cardAmt');
  const cardBtn = document.getElementById('payCardBtn');
  if (cardAmt) cardAmt.textContent = `$${rentFmt}`;
  if (cardBtn) cardBtn.textContent = rentFmt;
  const cardName = document.getElementById('card-name');
  if (cardName) cardName.placeholder = name;

  // ACH form
  const achType = document.getElementById('ach-pay-type');
  if (achType) achType.innerHTML = `<option value="${rent}">Monthly Rent — $${rentFmt}</option><option value="100">Late Fee — $100</option>`;
  const achAmt = document.getElementById('achAmt');
  if (achAmt) achAmt.textContent = `$${rentFmt}`;
  const achName = document.getElementById('ach-name');
  if (achName) achName.placeholder = name;

  // Digital form
  const digAmt = document.getElementById('digitalAmt');
  if (digAmt) digAmt.textContent = `$${rentFmt}`;
  const digEmail = document.getElementById('digital-email');
  if (digEmail) digEmail.value = email;

  // Pay period dropdowns — current + next 3 months
  const now = new Date();
  let periodHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    periodHTML += `<option>${label}</option>`;
  }
  ['card-pay-period', 'ach-pay-period'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = periodHTML;
  });
}

async function loadMaintenanceRequests(tenantId) {
  const { data: requests, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const container = document.getElementById('maint-requests-list');
  const statMaint = document.getElementById('stat-maint');

  if (error || !requests?.length) {
    if (statMaint) statMaint.textContent = '0';
    return;
  }

  const openCount = requests.filter(r => r.status === 'open' || r.status === 'in_progress').length;
  if (statMaint) statMaint.textContent = openCount;
  setBadge('maintBadge', openCount);

  const statusMap  = { open: { cls: 'status-open', label: 'Open' }, in_progress: { cls: 'status-prog', label: 'In Progress' }, completed: { cls: 'status-done', label: 'Completed' }, cancelled: { cls: 'status-done', label: 'Cancelled' } };
  const priorityMap = { low: 'chip-green', medium: 'chip-yellow', high: 'chip-red', emergency: 'chip-red' };

  if (container) {
    container.innerHTML = '<div class="pcard-title" style="margin-bottom:1rem;"><span>📋</span> Your Requests</div>' +
      requests.map(r => {
        const s = statusMap[r.status] || statusMap.open;
        const p = priorityMap[r.priority] || 'chip-yellow';
        const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `<div class="maint-card">
          <div class="mc-top">
            <div><div class="mc-title">${r.title}</div><div class="mc-date">Submitted ${date}</div></div>
            <span class="chip ${p}" style="font-size:0.68rem;padding:0.2rem 0.6rem;">${r.priority.charAt(0).toUpperCase()+r.priority.slice(1)}</span>
          </div>
          <div class="mc-desc">${r.description || ''}</div>
          <span class="mc-status ${s.cls}"><span class="status-dot"></span> ${s.label}</span>
        </div>`;
      }).join('');
  }

  // Update recent activity on dashboard
  updateRecentActivity(requests);
}

async function loadPaymentHistory(tenantId) {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(10);

  const tbody = document.getElementById('pay-hist-body');
  if (!tbody) return;

  if (error || !payments?.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);font-size:0.85rem;">
      <div style="font-size:1.8rem;margin-bottom:0.5rem;">📭</div>
      No payment history yet. Payments will appear here after your first transaction.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = payments.map(p => {
    const date   = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const amount = parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const method = p.payment_method ? p.payment_method.toUpperCase() : '—';
    const type   = p.payment_type   ? p.payment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—';
    const period = p.pay_period_month ? `${new Date(2000, p.pay_period_month - 1).toLocaleString('default', { month: 'long' })} ${p.pay_period_year}` : '';
    return `<tr>
      <td>${date}</td>
      <td>${type}${period ? ' — ' + period : ''}</td>
      <td>${method}</td>
      <td><strong>$${amount}</strong></td>
      <td><span class="chip chip-green">Paid</span></td>
    </tr>`;
  }).join('');

  // Update recent activity with payments
  updateRecentActivityPayments(payments);
}

async function loadDocuments(tenantId) {
  const { data: docs, error } = await supabase
    .from('documents')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  const pendingList = document.getElementById('docs-pending-list');
  const signedList  = document.getElementById('docs-signed-list');
  const allList     = document.getElementById('docs-all-list');
  const dashDocs    = document.getElementById('dash-docs');
  const docBadge    = document.getElementById('docBadge');

  if (error || !docs?.length) return;

  const pending = docs.filter(d => d.status !== 'completed' && d.status !== 'signed' && d.status !== 'declined');
  const signed  = docs.filter(d => d.status === 'completed' || d.status === 'signed');

  // Update badges
  setBadge('docBadge', pending.length);
  setBadge('pendingBadgeTab', pending.length);

  const renderDoc = (d, showSign) => {
    const date = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const isSigned = d.status === 'completed' || d.status === 'signed';
    return `<div class="doc-card">
      <div class="doc-icon">📋</div>
      <div class="doc-info">
        <div class="doc-name">${d.name}</div>
        <div class="doc-meta">${isSigned ? 'Signed' : 'Sent'} ${date}</div>
      </div>
      <div class="doc-actions">
        <button class="view-btn">👁 View</button>
        ${isSigned ? '<span class="signed-badge">✅ Signed</span>' : (showSign ? `<button class="sign-btn" onclick="openDocModal('${d.name}')">✍️ Sign with DocuSign</button>` : '')}
      </div>
    </div>`;
  };

  if (pendingList) pendingList.innerHTML = pending.length ? pending.map(d => renderDoc(d, true)).join('') : `<div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;"><div style="font-size:2rem;margin-bottom:0.5rem;">✅</div>No documents pending signature.</div>`;
  if (signedList)  signedList.innerHTML  = signed.length  ? signed.map(d => renderDoc(d, false)).join('') : `<div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;"><div style="font-size:2rem;margin-bottom:0.5rem;">📁</div>No signed documents yet.</div>`;
  if (allList)     allList.innerHTML     = docs.length    ? docs.map(d => renderDoc(d, !( d.status === 'completed' || d.status === 'signed'))).join('') : `<div style="text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem;">No documents yet.</div>`;

  // Dashboard pending docs
  if (dashDocs) {
    dashDocs.innerHTML = pending.length
      ? pending.map(d => `<div style="display:flex;align-items:center;gap:0.8rem;padding:0.9rem;background:var(--pale);border:1.5px solid var(--light);border-radius:10px;margin-bottom:0.5rem;">
          <div style="font-size:1.4rem;">📋</div>
          <div style="flex:1;"><div style="font-size:0.86rem;font-weight:800;color:var(--navy);">${d.name}</div><div style="font-size:0.73rem;color:var(--muted);">Awaiting your signature</div></div>
          <button class="sign-btn" onclick="openDocModal('${d.name}')">✍️ Sign</button>
        </div>`).join('')
      : `<div style="text-align:center;padding:1.5rem;color:var(--muted);font-size:0.85rem;"><div style="font-size:1.8rem;margin-bottom:0.5rem;">✅</div>No documents pending signature.</div>`;
  }
}

function updateRecentActivity(requests) {
  const activity = document.getElementById('dash-activity');
  if (!activity || !requests?.length) return;

  const recent = requests.slice(0, 3);
  const statusLabel = { open: 'Open', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
  const statusChip  = { open: 'chip-blue', in_progress: 'chip-yellow', completed: 'chip-green', cancelled: 'chip-green' };

  activity.innerHTML = recent.map(r => {
    const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<div class="ai">
      <div class="ai-icon ai-yellow">🔧</div>
      <div style="flex:1;"><div class="ai-title">${r.title}</div><div class="ai-date">${date}</div></div>
      <span class="chip ${statusChip[r.status] || 'chip-blue'}">${statusLabel[r.status] || 'Open'}</span>
    </div>`;
  }).join('');
}

function updateRecentActivityPayments(payments) {
  const activity = document.getElementById('dash-activity');
  if (!activity || !payments?.length) return;

  const recent = payments.slice(0, 3);
  const existing = activity.innerHTML;
  const payHTML = recent.map(p => {
    const date   = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const amount = parseFloat(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const type   = p.payment_type ? p.payment_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Payment';
    return `<div class="ai">
      <div class="ai-icon ai-green">💰</div>
      <div style="flex:1;"><div class="ai-title">${type}</div><div class="ai-date">${date}</div></div>
      <div class="ai-amt">$${amount}</div>
    </div>`;
  }).join('');

  // If no maintenance activity yet just show payments, otherwise prepend
  if (existing.includes('No activity yet')) {
    activity.innerHTML = payHTML;
  } else {
    activity.innerHTML = payHTML + existing;
  }
}

async function doLogout() {
  clearAutoSignout();
  await supabase.auth.signOut();
  window._windwardTenantId = null;
  window._windwardUnitId   = null;
  document.getElementById('portal-dashboard').classList.remove('show');
  unmountPrivilegedViews();
  document.getElementById('portal-login-screen').style.display = 'flex';
  document.getElementById('loginPass').value = '';
  backToSite();
}

/* ═══════════════════════════════════
   PORTAL — NAVIGATION
═══════════════════════════════════ */
function showPPage(name, el) {
  document.querySelectorAll('.ppage').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  document.getElementById('ppage-' + name).classList.add('active');
  if (el) el.classList.add('active');
  // Mount Stripe element when payments page is shown
  if (name === 'payments') setTimeout(mountStripeElement, 100);
}

/* ═══════════════════════════════════
   PORTAL — PAYMENTS
═══════════════════════════════════ */
function switchPTab(name, el) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ppanel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ppanel-' + name).classList.add('active');
}
function updatePayAmt() {
  const cardType = document.getElementById('card-pay-type');
  if (!cardType) return;
  const val = parseFloat(cardType.value) || window._tenantRent || 0;
  const fmt = val.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const cardAmt = document.getElementById('cardAmt');
  const cardBtn = document.getElementById('payCardBtn');
  if (cardAmt) cardAmt.textContent = `$${fmt}`;
  if (cardBtn) cardBtn.textContent = fmt;
}
function updateCardAmt(val) { updatePayAmt(); }
function fmtCard(i) { let v = i.value.replace(/\D/g,'').substring(0,16); i.value = v.replace(/(.{4})/g,'$1 ').trim(); }
function fmtExp(i)  { let v = i.value.replace(/\D/g,''); if (v.length>=3) v = v.substring(0,2)+'/'+v.substring(2,4); i.value = v; }

function submitPay(type) {
  if (type === 'card') {
    document.getElementById('pfh-card').style.display = 'none';
    document.getElementById('pfb-card').style.display = 'none';
    document.getElementById('pff-card').style.display = 'none';
    document.getElementById('psucc-card').style.display = 'block';
  } else if (type === 'ach') {
    document.getElementById('pfb-ach').style.display = 'none';
    document.getElementById('psucc-ach').style.display = 'block';
  } else {
    document.getElementById('pfb-digital').style.display = 'none';
    document.getElementById('psucc-digital').style.display = 'block';
  }
}
function resetPay(type) {
  if (type === 'card') {
    document.getElementById('pfh-card').style.display = '';
    document.getElementById('pfb-card').style.display = '';
    document.getElementById('pff-card').style.display = '';
    document.getElementById('psucc-card').style.display = 'none';
  } else if (type === 'ach') {
    document.getElementById('pfb-ach').style.display = '';
    document.getElementById('psucc-ach').style.display = 'none';
  } else {
    document.getElementById('pfb-digital').style.display = '';
    document.getElementById('psucc-digital').style.display = 'none';
  }
}

/* ═══════════════════════════════════
   PORTAL — MAINTENANCE
═══════════════════════════════════ */
function selectPri(btn) {
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}
async function submitMaint() {
  const tenantId = window._windwardTenantId;
  const unitId   = window._windwardUnitId;

  if (!tenantId) { showToast('⚠️ Please log in again.'); return; }

  const category    = document.querySelector('#ppage-maintenance .fg select').value;
  const title       = document.querySelector('#ppage-maintenance input[placeholder="e.g. Leaky faucet in bathroom"]').value.trim();
  const description = document.querySelector('#ppage-maintenance textarea').value.trim();
  const priorityBtn = document.querySelector('.priority-btn.selected');
  const priority    = priorityBtn ? priorityBtn.textContent.replace(/[^a-zA-Z]/g,'').toLowerCase() : 'medium';
  const entrySelect = document.querySelectorAll('#ppage-maintenance .fg select')[2];
  const entryMap    = { 0: 'yes', 1: 'no', 2: 'call_first' };
  const entry       = entryMap[entrySelect?.selectedIndex] || 'yes';

  if (!title) { showToast('⚠️ Please enter an issue title.'); return; }

  const btn = document.querySelector('#ppage-maintenance .submit-btn');
  btn.textContent = 'Submitting…';
  btn.disabled = true;

  const { error } = await supabase
    .from('maintenance_requests')
    .insert({
      tenant_id:        tenantId,
      unit_id:          unitId,
      category:         category.toLowerCase().replace(/\s*\/\s*/g,'_').replace(/\s+/g,'_'),
      title,
      description,
      priority,
      entry_permission: entry,
      status:           'open'
    });

  btn.textContent = 'Submit Request';
  btn.disabled = false;

  if (error) {
    showToast('❌ Could not submit request. Please try again.');
    console.error(error);
    return;
  }

  const s = document.getElementById('maintSuccess');
  s.classList.add('show');
  setTimeout(() => s.classList.remove('show'), 4000);

  // Reload requests list and update badge
  await loadMaintenanceRequests(tenantId);

  // Clear form
  document.querySelector('#ppage-maintenance input[placeholder="e.g. Leaky faucet in bathroom"]').value = '';
  document.querySelector('#ppage-maintenance textarea').value = '';
}

/* ═══════════════════════════════════
   PORTAL — DOCUMENTS
═══════════════════════════════════ */
function switchDocTab(name, el) {
  document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.doc-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('docpanel-' + name).classList.add('active');
}

/* ═══════════════════════════════════
   DOCUSIGN INTEGRATION
═══════════════════════════════════ */
const DOCUSIGN_FUNCTION_URL = 'https://ljlpnigkeiseehsfectn.supabase.co/functions/v1/docusign';

async function openDocModal(docName) {
  // If no tenant logged in fall back to demo modal
  if (!window._windwardTenantId) {
    document.getElementById('modalDocTitle').textContent = docName;
    document.getElementById('docModal').classList.add('show');
    clearSignature();
    return;
  }

  // Get tenant info
  const tenantName  = window._tenantFullName;
  const tenantEmail = window._tenantEmail;

  if (!tenantName || !tenantEmail) {
    showToast('⚠️ Could not load your info. Please log out and back in.');
    return;
  }

  showToast('📋 Opening DocuSign... please wait.');

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(DOCUSIGN_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        action:      'send',
        tenantName,
        tenantEmail
      })
    });

    const result = await res.json();

    if (result.error) {
      showToast(`❌ DocuSign error: ${result.error}`);
      return;
    }

    // Store envelope ID for status tracking
    window._currentEnvelopeId = result.envelopeId;

    // Open signing URL in popup
    const popup = window.open(
      result.signingUrl,
      'DocuSign',
      'width=900,height=700,scrollbars=yes,resizable=yes'
    );

    // Poll for completion
    const pollInterval = setInterval(async () => {
      if (popup.closed) {
        clearInterval(pollInterval);
        // Check status
        await checkDocuSignStatus(result.envelopeId);
      }
    }, 2000);

  } catch (err) {
    showToast('❌ Could not connect to DocuSign. Please try again.');
    console.error('DocuSign error:', err);
  }
}

async function checkDocuSignStatus(envelopeId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(DOCUSIGN_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'status', envelopeId })
    });

    const result = await res.json();

    if (result.status === 'completed') {
      showToast('✅ Document signed successfully! A copy has been emailed to you.');

      // Update document in Supabase
      if (window._windwardTenantId) {
        await supabase.from('documents').upsert({
          tenant_id:            window._windwardTenantId,
          name:                 'Lease Agreement',
          document_type:        'lease',
          docusign_envelope_id: envelopeId,
          status:               'completed',
          signed_at:            new Date().toISOString()
        });

        // Reload documents
        await loadDocuments(window._windwardTenantId);
        setBadge('docBadge', 0);
        setBadge('pendingBadgeTab', 0);
      }
    } else if (result.status === 'sent' || result.status === 'delivered') {
      showToast('📋 Document sent but not yet signed. Check your email to complete signing.');
    }
  } catch (err) {
    console.error('Status check error:', err);
  }
}

/* ═══════════════════════════════════
   TOAST
═══════════════════════════════════ */
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--navy);color:white;padding:0.9rem 1.4rem;border-radius:10px;font-size:0.85rem;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:9998;opacity:0;transform:translateY(12px);transition:opacity 0.3s,transform 0.3s;max-width:340px;line-height:1.4;font-family:Nunito,sans-serif;';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(12px)'; setTimeout(() => t.remove(), 300); }, 4500);
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  if (count && count > 0) {
    el.textContent = count > 99 ? '99+' : count;
    el.style.display = '';
  } else {
    el.style.display = 'none';
  }
}

function confirmSign() {
  closeDocModal();
  setBadge('docBadge', 0);
  setBadge('pendingBadgeTab', 0);
  const notice = document.getElementById('dashNotice');
  if (notice) notice.style.display = 'none';
  showToast('✅ Document signed successfully! A copy has been emailed to you.');
  if (window._windwardTenantId) loadDocuments(window._windwardTenantId);
}

function closeDocModal() { document.getElementById('docModal').classList.remove('show'); }
function clearSignature() {
  const pad = document.getElementById('signPad');
  const btn = document.getElementById('confirmSignBtn');
  const clr = document.getElementById('sigClear');
  if (pad) pad.classList.remove('signed');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
  if (clr) clr.style.display = 'none';
}
function applySignature() {
  const pad = document.getElementById('signPad');
  const btn = document.getElementById('confirmSignBtn');
  const clr = document.getElementById('sigClear');
  if (pad) pad.classList.add('signed');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  if (clr) clr.style.display = 'block';
}

// Close modal on overlay click
document.getElementById('docModal').addEventListener('click', function(e) { if (e.target === this) closeDocModal(); });

/* ═══════════════════════════════════
   AUTH SCREEN HELPERS
═══════════════════════════════════ */
function showLogin() {
  document.getElementById('portal-login-screen').style.display = 'flex';
  document.getElementById('portal-setpassword-screen').style.display = 'none';
  document.getElementById('portal-forgot-screen').style.display = 'none';
}
function showForgotPassword() {
  document.getElementById('portal-login-screen').style.display = 'none';
  document.getElementById('portal-forgot-screen').style.display = 'flex';
}

/* ═══════════════════════════════════
   DETECT INVITE / RESET TOKEN ON LOAD
═══════════════════════════════════ */
window.addEventListener('load', async () => {

  // Read token saved at very top of page before anything could clear it
  const token   = sessionStorage.getItem('sb_access_token');
  const refresh = sessionStorage.getItem('sb_refresh_token') || '';
  const type    = sessionStorage.getItem('sb_token_type');

  // Clear immediately
  sessionStorage.removeItem('sb_access_token');
  sessionStorage.removeItem('sb_refresh_token');
  sessionStorage.removeItem('sb_token_type');

  if (token) {
    const { error } = await supabase.auth.setSession({
      access_token:  token,
      refresh_token: refresh
    });

    window.history.replaceState({}, document.title, window.location.pathname);

    if (!error) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-portal').classList.add('active');

      if (type === 'invite' || type === 'signup' || type === 'recovery') {
        document.getElementById('portal-login-screen').style.display = 'none';
        document.getElementById('portal-setpassword-screen').style.display = 'flex';
        document.getElementById('portal-forgot-screen').style.display = 'none';
      } else {
        document.getElementById('portal-login-screen').style.display = 'none';
        mountPortalDashboard();
        document.getElementById('portal-dashboard').classList.add('show');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await loadTenantData(user);
      }
    } else {
      console.error('Token error:', error.message);
    }
    return;
  }

  // No token — check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-portal').classList.add('active');
    document.getElementById('portal-login-screen').style.display = 'none';

    if (isAdmin(session.user.email)) {
      mountAdminDashboard();
      switchView('admin');
      loadAdminOverview();
    } else if (isEmployee(session.user.email)) {
      mountEmployeePortal();
      switchView('employee');
      loadEmployeeOverview();
    } else {
      mountPortalDashboard();
      document.getElementById('portal-dashboard').classList.add('show');
      await loadTenantData(session.user);
    }
    startAutoSignout();
  }
});

/* ═══════════════════════════════════
   SET PASSWORD (after invite)
═══════════════════════════════════ */
async function doSetPassword() {
  const newPass     = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmPass').value;
  const err         = document.getElementById('setPassError');
  const btn         = document.querySelector('#portal-setpassword-screen .login-btn');

  if (newPass.length < 8) {
    err.textContent = 'Password must be at least 8 characters.';
    err.classList.add('show');
    return;
  }
  if (newPass !== confirmPass) {
    err.textContent = 'Passwords do not match. Please try again.';
    err.classList.add('show');
    return;
  }

  err.classList.remove('show');
  btn.textContent = 'Setting up your account…';
  btn.disabled = true;

  const { data, error } = await supabase.auth.updateUser({ password: newPass });

  if (error) {
    err.textContent = 'Could not set password. Please try the invite link again.';
    err.classList.add('show');
    btn.textContent = 'Set Password & Sign In';
    btn.disabled = false;
    return;
  }

  // Sign out the invite session so they log in fresh
  await supabase.auth.signOut();

  // Send them to login screen
  document.getElementById('portal-setpassword-screen').style.display = 'none';
  document.getElementById('portal-login-screen').style.display = 'flex';
  showToast('✅ Password set! Please sign in with your new password.');
  btn.textContent = 'Set Password & Sign In';
  btn.disabled = false;
}

/* ═══════════════════════════════════
   FORGOT PASSWORD
═══════════════════════════════════ */
async function doForgotPassword() {
  const email = document.getElementById('forgotEmail').value.trim();
  const err   = document.getElementById('forgotError');
  const succ  = document.getElementById('forgotSuccess');
  const btn   = document.querySelector('#portal-forgot-screen .login-btn');

  if (!email) {
    err.textContent = 'Please enter your email address.';
    err.classList.add('show');
    return;
  }

  err.classList.remove('show');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://windward.live'
  });

  btn.textContent = 'Send Reset Link';
  btn.disabled = false;

  if (error) {
    err.textContent = 'Could not send reset email. Please try again.';
    err.classList.add('show');
    return;
  }

  succ.style.display = 'block';
  setTimeout(() => showLogin(), 4000);
}

/* ═══════════════════════════════════
   AUTO SIGNOUT
═══════════════════════════════════ */
let _autoSignoutTimer = null;

function startAutoSignout() {
  clearAutoSignout();
  // Auto signout after 60 minutes
  _autoSignoutTimer = setTimeout(async () => {
    await doLogout();
    showToast('🔒 You have been signed out after 60 minutes of inactivity.');
  }, 60 * 60 * 1000);
}

function clearAutoSignout() {
  if (_autoSignoutTimer) {
    clearTimeout(_autoSignoutTimer);
    _autoSignoutTimer = null;
  }
}

// Sign out when page/tab is closed or navigated away
window.addEventListener('beforeunload', () => {
  if (_autoSignoutTimer) {
    // Mark that we need to sign out on next load
    localStorage.setItem('wb_signout', '1');
    // Also try sync signout
    supabase.auth.signOut();
  }
});

// Check on page load if we need to sign out from previous close
window.addEventListener('load', () => {
  if (localStorage.getItem('wb_signout') === '1') {
    localStorage.removeItem('wb_signout');
    supabase.auth.signOut();
  }
}, { once: true });

// Reset timer on any user activity
['click', 'keydown', 'scroll', 'mousemove'].forEach(event => {
  document.addEventListener(event, () => {
    if (_autoSignoutTimer) startAutoSignout();
  }, { passive: true });
});

/* ═══════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════ */
const ADMIN_EMAIL = 'windward.live@outlook.com';
const EMPLOYEE_EMAILS = ['marisa.pmservices@gmail.com'];

function isAdmin(email) { return email === ADMIN_EMAIL; }
function isEmployee(email) { return EMPLOYEE_EMAILS.includes(email); }
function isStaff(email) { return isAdmin(email) || isEmployee(email); }

function showAdminPage(name, el) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('apage-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'overview')    loadAdminOverview();
  if (name === 'tenants')     loadAdminTenants();
  if (name === 'payments')    loadAdminPayments();
  if (name === 'maintenance') loadAdminMaintenance();
  if (name === 'properties')  loadAdminProperties();
}

async function loadAdminOverview() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEl = document.getElementById('admin-greeting');
  if (greetEl) greetEl.textContent = `${greeting}, Daniel 👋`;

  const [tenantsRes, maintRes, unitsRes] = await Promise.all([
    supabase.from('tenants').select('id, rent_amount'),
    supabase.from('maintenance_requests').select('id').in('status', ['open', 'in_progress']),
    supabase.from('units').select('id').eq('is_occupied', true)
  ]);
  const tenants = tenantsRes.data || [];
  const revenue = tenants.reduce((sum, t) => sum + parseFloat(t.rent_amount || 0), 0);
  document.getElementById('admin-stat-tenants').textContent = tenants.length;
  document.getElementById('admin-stat-revenue').textContent = `$${revenue.toLocaleString()}`;
  document.getElementById('admin-stat-maint').textContent   = (maintRes.data || []).length;
  document.getElementById('admin-stat-units').textContent   = (unitsRes.data || []).length;

  const { data: recent } = await supabase
    .from('maintenance_requests')
    .select('*, tenants(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const container = document.getElementById('admin-recent-maint');
  if (!recent?.length) { container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--muted);">No maintenance requests yet.</div>'; return; }
  const sMap = { open:'status-open', in_progress:'status-prog', completed:'status-done', cancelled:'status-done' };
  const sLbl = { open:'Open', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
  container.innerHTML = `<table class="pay-hist-table"><thead><tr><th>Tenant</th><th>Issue</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>${
    recent.map(r => `<tr>
      <td>${r.tenants?.first_name||'—'} ${r.tenants?.last_name||''}</td>
      <td><strong>${r.title}</strong></td>
      <td><span class="chip ${r.priority==='high'||r.priority==='emergency'?'chip-red':r.priority==='medium'?'chip-yellow':'chip-green'}">${r.priority}</span></td>
      <td><span class="mc-status ${sMap[r.status]||'status-open'}" style="font-size:0.72rem;"><span class="status-dot"></span>${sLbl[r.status]||'Open'}</span></td>
      <td>${r.status!=='completed'?`<button onclick="updateMaintStatus('${r.id}','completed')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--success);color:white;border:none;border-radius:5px;cursor:pointer;">✓ Complete</button>`:''}</td>
    </tr>`).join('')
  }</tbody></table>`;
}

async function loadAdminTenants() {
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, units(unit_number, properties(name))')
    .order('last_name');
  const tbody = document.getElementById('admin-tenants-body');
  if (!tenants?.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted);">No tenants yet.</td></tr>'; return; }
  tbody.innerHTML = tenants.map(t => {
    const leaseEnd = t.lease_end ? new Date(t.lease_end).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
    const expiring = t.lease_end && (new Date(t.lease_end) - new Date()) < 60*24*60*60*1000;
    return `<tr>
      <td><strong>${t.first_name} ${t.last_name}</strong><br><span style="font-size:0.75rem;color:var(--muted);">${t.email}</span></td>
      <td>${t.units?.properties?.name||'—'}</td>
      <td>${t.units?.unit_number||'—'}</td>
      <td><strong>$${parseFloat(t.rent_amount).toLocaleString('en-US',{minimumFractionDigits:2})}</strong></td>
      <td style="color:${expiring?'var(--warning)':'inherit'};font-weight:${expiring?'700':'400'}">${leaseEnd}</td>
      <td><span class="chip chip-green">Active</span></td>
    </tr>`;
  }).join('');
}

async function loadAdminPayments() {
  const { data: payments } = await supabase.from('payments').select('*, tenants(first_name, last_name)').order('created_at', { ascending: false }).limit(50);
  const tbody = document.getElementById('admin-payments-body');
  if (!payments?.length) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted);">No payments yet.</td></tr>'; return; }
  tbody.innerHTML = payments.map(p => `<tr>
    <td>${new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
    <td>${p.tenants?.first_name||'—'} ${p.tenants?.last_name||''}</td>
    <td><strong>$${parseFloat(p.amount).toLocaleString('en-US',{minimumFractionDigits:2})}</strong></td>
    <td>${p.payment_method?.toUpperCase()||'—'}</td>
    <td><span class="chip chip-green">Paid</span></td>
  </tr>`).join('');
}

async function loadAdminMaintenance() {
  const { data: requests } = await supabase.from('maintenance_requests').select('*, tenants(first_name, last_name, units(unit_number, properties(name)))').order('created_at', { ascending: false });
  const container = document.getElementById('admin-maint-list');
  if (!requests?.length) { container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">No maintenance requests yet.</div>'; return; }
  const sMap = { open:'status-open', in_progress:'status-prog', completed:'status-done', cancelled:'status-done' };
  const sLbl = { open:'Open', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
  container.innerHTML = `<table class="pay-hist-table"><thead><tr><th>Tenant</th><th>Location</th><th>Issue</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>${
    requests.map(r => `<tr>
      <td>${r.tenants?.first_name||'—'} ${r.tenants?.last_name||''}</td>
      <td>${r.tenants?.units?.properties?.name||'—'} · ${r.tenants?.units?.unit_number||'—'}</td>
      <td><strong>${r.title}</strong><br><span style="font-size:0.75rem;color:var(--muted);">${r.description||''}</span></td>
      <td><span class="chip ${r.priority==='high'||r.priority==='emergency'?'chip-red':r.priority==='medium'?'chip-yellow':'chip-green'}">${r.priority}</span></td>
      <td><span class="mc-status ${sMap[r.status]||'status-open'}" style="font-size:0.72rem;"><span class="status-dot"></span>${sLbl[r.status]||'Open'}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${r.status==='open'?`<button onclick="updateMaintStatus('${r.id}','in_progress')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--warning);color:white;border:none;border-radius:5px;cursor:pointer;">In Progress</button>`:''}
        ${r.status!=='completed'?`<button onclick="updateMaintStatus('${r.id}','completed')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--success);color:white;border:none;border-radius:5px;cursor:pointer;">Complete</button>`:''}
      </td>
    </tr>`).join('')
  }</tbody></table>`;
}

async function loadAdminProperties() {
  const { data: properties } = await supabase.from('properties').select('*, units(id, unit_number, bedrooms, rent_amount, is_occupied)');
  const container = document.getElementById('admin-properties-list');
  if (!properties?.length) { container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">No properties found.</div>'; return; }
  container.innerHTML = properties.map(p => {
    const occupied = p.units?.filter(u => u.is_occupied).length || 0;
    const total    = p.units?.length || 0;
    return `<div class="pcard" style="margin-bottom:1.2rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--navy);">${p.name}</div>
          <div style="font-size:0.82rem;color:var(--muted);">📍 ${p.address}, ${p.city}, ${p.state} ${p.zip}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.85rem;font-weight:700;color:var(--navy);">${occupied}/${total} occupied</div>
          <div style="font-size:0.75rem;color:var(--muted);">${total-occupied} vacant</div>
        </div>
      </div>
      <table class="pay-hist-table"><thead><tr><th>Unit</th><th>Beds</th><th>Rent</th><th>Status</th></tr></thead>
      <tbody>${(p.units||[]).sort((a,b)=>a.unit_number.localeCompare(b.unit_number)).map(u=>`
        <tr>
          <td><strong>${u.unit_number}</strong></td>
          <td>${u.bedrooms} bed</td>
          <td>$${parseFloat(u.rent_amount).toLocaleString('en-US',{minimumFractionDigits:2})}</td>
          <td><span class="chip ${u.is_occupied?'chip-green':'chip-blue'}">${u.is_occupied?'Occupied':'Vacant'}</span></td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
  }).join('');
}

async function updateMaintStatus(id, status) {
  await supabase.from('maintenance_requests').update({ status, ...(status==='completed'?{completed_at:new Date().toISOString()}:{}) }).eq('id', id);
  showToast(`✅ Request marked as ${status.replace('_',' ')}`);
  loadAdminMaintenance();
  loadAdminOverview();
}

/* ═══════════════════════════════════
   EMPLOYEE PORTAL
═══════════════════════════════════ */
function showEmployeePage(name, el) {
  document.querySelectorAll('#view-employee .admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#view-employee .admin-nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('epage-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'overview')    loadEmployeeOverview();
  if (name === 'tenants')     loadEmployeeTenants();
  if (name === 'maintenance') loadEmployeeMaintenance();
  if (name === 'properties')  loadEmployeeProperties();
  if (name === 'leads')       loadEmployeeLeads();
}

async function loadEmployeeOverview() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const el = document.getElementById('employee-greeting');
  if (el) el.textContent = `${greeting}, Marisa 👋`;

  const [tenantsRes, maintRes, unitsRes] = await Promise.all([
    supabase.from('tenants').select('id'),
    supabase.from('maintenance_requests').select('id').in('status', ['open', 'in_progress']),
    supabase.from('units').select('id').eq('is_occupied', true)
  ]);
  document.getElementById('emp-stat-tenants').textContent = (tenantsRes.data || []).length;
  document.getElementById('emp-stat-maint').textContent   = (maintRes.data || []).length;
  document.getElementById('emp-stat-units').textContent   = (unitsRes.data || []).length;

  const { data: recent } = await supabase
    .from('maintenance_requests')
    .select('*, tenants(first_name, last_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  const container = document.getElementById('emp-recent-maint');
  if (!recent?.length) { container.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--muted);">No maintenance requests yet.</div>'; return; }
  const sMap = { open:'status-open', in_progress:'status-prog', completed:'status-done', cancelled:'status-done' };
  const sLbl = { open:'Open', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
  container.innerHTML = `<table class="pay-hist-table"><thead><tr><th>Tenant</th><th>Issue</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>${
    recent.map(r => `<tr>
      <td>${r.tenants?.first_name||'—'} ${r.tenants?.last_name||''}</td>
      <td><strong>${r.title}</strong></td>
      <td><span class="chip ${r.priority==='high'||r.priority==='emergency'?'chip-red':r.priority==='medium'?'chip-yellow':'chip-green'}">${r.priority}</span></td>
      <td><span class="mc-status ${sMap[r.status]||'status-open'}" style="font-size:0.72rem;"><span class="status-dot"></span>${sLbl[r.status]||'Open'}</span></td>
      <td>${r.status!=='completed'?`<button onclick="updateMaintStatus('${r.id}','completed')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--success);color:white;border:none;border-radius:5px;cursor:pointer;">✓ Complete</button>`:''}</td>
    </tr>`).join('')
  }</tbody></table>`;
}

async function loadEmployeeTenants() {
  const { data: tenants } = await supabase
    .from('tenants')
    .select('*, units(unit_number, rent_amount, properties(name))')
    .order('last_name');

  const tbody = document.getElementById('emp-tenants-body');
  if (!tenants?.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted);">No tenants yet.</td></tr>';
    return;
  }

  // Check who has paid this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: payments } = await supabase
    .from('payments')
    .select('tenant_id, amount, status')
    .gte('created_at', monthStart)
    .eq('status', 'paid');

  const paidTenantIds = new Set((payments || []).map(p => p.tenant_id));

  tbody.innerHTML = tenants.map(t => {
    const leaseEnd  = t.lease_end ? new Date(t.lease_end).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
    const expiring  = t.lease_end && (new Date(t.lease_end) - new Date()) < 60*24*60*60*1000;
    const hasPaid   = paidTenantIds.has(t.id);
    const rent      = parseFloat(t.rent_amount || t.units?.rent_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const monthName = now.toLocaleString('default', { month: 'long' });

    return `<tr>
      <td><strong>${t.first_name} ${t.last_name}</strong><br><span style="font-size:0.75rem;color:var(--muted);">${t.email}</span></td>
      <td>${t.phone ? `<a href="tel:${t.phone}" style="color:var(--mid);font-weight:700;text-decoration:none;white-space:nowrap;">${fmtPhone(t.phone)}</a>` : '<span style="color:var(--muted);">—</span>'}</td>
      <td>${t.units?.properties?.name||'—'}</td>
      <td>${t.units?.unit_number||'—'}</td>
      <td><strong>$${rent}</strong></td>
      <td style="color:${expiring?'var(--warning)':'inherit'};font-weight:${expiring?'700':'400'}">${leaseEnd}</td>
      <td>
        ${hasPaid
          ? '<span class="chip chip-green">✅ Paid</span>'
          : `<span class="chip chip-red">⚠️ Unpaid</span>`
        }
      </td>
      <td>
        ${!hasPaid
          ? `<button onclick="sendRentReminder('${t.email}','${t.first_name}','${rent}','${monthName}')" style="font-size:0.72rem;font-weight:700;padding:0.3rem 0.8rem;background:var(--accent);color:white;border:none;border-radius:6px;cursor:pointer;white-space:nowrap;">📧 Remind</button>`
          : '<span style="font-size:0.75rem;color:var(--muted);">—</span>'
        }
      </td>
    </tr>`;
  }).join('');
}

async function sendRentReminder(email, firstName, rentAmount, month) {
  const btn = window.event?.target || document.activeElement;
  if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

  try {
    const res = await fetch('https://ljlpnigkeiseehsfectn.supabase.co/functions/v1/send-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbHBuaWdrZWlzZWVoc2ZlY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzMyMzgsImV4cCI6MjA5Mzc0OTIzOH0.jGgYuUyTZ7X6tZhDbX2BEPt7pokUIq9el5N2GsYkjnU`
      },
      body: JSON.stringify({
        fname: 'Windward',
        lname: 'Properties',
        email: 'noreply@windward.live',
        message: `RENT_REMINDER|${email}|${firstName}|${rentAmount}|${month}`
      })
    });

    const result = await res.json();
    if (result.success) {
      btn.textContent = '✓ Sent!';
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.textContent = '📧 Remind';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
      showToast(`✅ Rent reminder sent to ${firstName}!`);
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    showToast('❌ Could not send reminder. Try again.');
    if (btn) { btn.textContent = '📧 Remind'; btn.disabled = false; }
  }
}

async function loadEmployeeMaintenance() {
  const { data: requests } = await supabase.from('maintenance_requests').select('*, tenants(first_name, last_name, units(unit_number, properties(name)))').order('created_at', { ascending: false });
  const container = document.getElementById('emp-maint-list');
  if (!requests?.length) { container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">No maintenance requests yet.</div>'; return; }
  const sMap = { open:'status-open', in_progress:'status-prog', completed:'status-done', cancelled:'status-done' };
  const sLbl = { open:'Open', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
  container.innerHTML = `<table class="pay-hist-table"><thead><tr><th>Tenant</th><th>Location</th><th>Issue</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead><tbody>${
    requests.map(r => `<tr>
      <td>${r.tenants?.first_name||'—'} ${r.tenants?.last_name||''}</td>
      <td>${r.tenants?.units?.properties?.name||'—'} · ${r.tenants?.units?.unit_number||'—'}</td>
      <td><strong>${r.title}</strong><br><span style="font-size:0.75rem;color:var(--muted);">${r.description||''}</span></td>
      <td><span class="chip ${r.priority==='high'||r.priority==='emergency'?'chip-red':r.priority==='medium'?'chip-yellow':'chip-green'}">${r.priority}</span></td>
      <td><span class="mc-status ${sMap[r.status]||'status-open'}" style="font-size:0.72rem;"><span class="status-dot"></span>${sLbl[r.status]||'Open'}</span></td>
      <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
        ${r.status==='open'?`<button onclick="updateMaintStatus('${r.id}','in_progress')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--warning);color:white;border:none;border-radius:5px;cursor:pointer;">In Progress</button>`:''}
        ${r.status!=='completed'?`<button onclick="updateMaintStatus('${r.id}','completed')" style="font-size:0.7rem;font-weight:700;padding:0.25rem 0.6rem;background:var(--success);color:white;border:none;border-radius:5px;cursor:pointer;">Complete</button>`:''}
      </td>
    </tr>`).join('')
  }</tbody></table>`;
}

async function loadEmployeeProperties() {
  const { data: properties } = await supabase.from('properties').select('*, units(id, unit_number, bedrooms, rent_amount, is_occupied)');
  const container = document.getElementById('emp-properties-list');
  if (!properties?.length) { container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);">No properties found.</div>'; return; }
  container.innerHTML = properties.map(p => {
    const occupied = p.units?.filter(u => u.is_occupied).length || 0;
    const total    = p.units?.length || 0;
    return `<div class="pcard" style="margin-bottom:1.2rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
        <div>
          <div style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;color:var(--navy);">${p.name}</div>
          <div style="font-size:0.82rem;color:var(--muted);">📍 ${p.address}, ${p.city}, ${p.state} ${p.zip}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.85rem;font-weight:700;color:var(--navy);">${occupied}/${total} occupied</div>
          <div style="font-size:0.75rem;color:var(--muted);">${total-occupied} vacant</div>
        </div>
      </div>
      <table class="pay-hist-table"><thead><tr><th>Unit</th><th>Beds</th><th>Status</th></tr></thead>
      <tbody>${(p.units||[]).sort((a,b)=>a.unit_number.localeCompare(b.unit_number)).map(u=>`
        <tr>
          <td><strong>${u.unit_number}</strong></td>
          <td>${u.bedrooms} bed</td>
          <td><span class="chip ${u.is_occupied?'chip-green':'chip-blue'}">${u.is_occupied?'Occupied':'Vacant'}</span></td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
  }).join('');
}

function doAdminLogout() {
  clearAutoSignout();
  supabase.auth.signOut();
  switchView('public');
  unmountPrivilegedViews();
}

function previewEmployeeView() {
  window._adminPreviewing = true;
  mountEmployeePortal();
  const label = document.getElementById('emp-signout-label');
  if (label) label.textContent = 'Back to Admin';
  switchView('employee');
  loadEmployeeOverview();
}

function fmtPhone(p) {
  const d = String(p).replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  return p;
}

/* ═══════════════════════════════════
   LEADS / INQUIRIES
═══════════════════════════════════ */
let _allLeads = [];
let _leadFilter = 'all';

async function loadEmployeeLeads() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  const container = document.getElementById('emp-leads-list');

  if (error) {
    container.innerHTML = `<div class="pcard" style="text-align:center;padding:2rem;color:var(--muted);">Could not load leads. Make sure the leads table exists in Supabase.</div>`;
    return;
  }

  _allLeads = leads || [];
  setBadge('leadsBadge', _allLeads.filter(l => l.status === 'new').length);
  renderLeads();
}

function filterLeads(status, el) {
  _leadFilter = status;
  document.querySelectorAll('.lead-filter').forEach(b => {
    b.style.background = 'white';
    b.style.color = 'var(--slate)';
    b.style.borderColor = 'var(--border)';
  });
  if (el) {
    el.style.background = 'var(--mid)';
    el.style.color = 'white';
    el.style.borderColor = 'var(--mid)';
  }
  renderLeads();
}

function renderLeads() {
  const container = document.getElementById('emp-leads-list');
  const leads = _leadFilter === 'all' ? _allLeads : _allLeads.filter(l => l.status === _leadFilter);

  if (!leads.length) {
    container.innerHTML = `<div class="pcard" style="text-align:center;padding:2.5rem;color:var(--muted);">
      <div style="font-size:2rem;margin-bottom:0.5rem;">📭</div>
      No ${_leadFilter === 'all' ? '' : _leadFilter + ' '}inquiries yet. New contact form submissions will appear here.
    </div>`;
    return;
  }

  container.innerHTML = leads.map(l => {
    const date = new Date(l.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    const time = new Date(l.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
    const isNew = l.status === 'new';
    return `<div class="pcard" style="margin-bottom:1rem;border-left:4px solid ${isNew ? 'var(--accent)' : 'var(--border)'};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:0.8rem;">
        <div>
          <div style="font-size:1rem;font-weight:800;color:var(--navy);">${l.first_name} ${l.last_name || ''}</div>
          <div style="font-size:0.78rem;color:var(--muted);">${date} at ${time}</div>
        </div>
        <span class="chip ${isNew ? 'chip-blue' : 'chip-green'}">${isNew ? '🆕 New' : '✅ Contacted'}</span>
      </div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:0.8rem;font-size:0.85rem;">
        <a href="mailto:${l.email}" style="color:var(--mid);font-weight:700;text-decoration:none;">✉️ ${l.email}</a>
        ${l.phone ? `<a href="tel:${l.phone}" style="color:var(--mid);font-weight:700;text-decoration:none;">📞 ${fmtPhone(l.phone)}</a>` : ''}
      </div>
      ${l.interest ? `<div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.6rem;"><strong style="color:var(--navy);">Interested in:</strong> ${l.interest}</div>` : ''}
      <div style="font-size:0.86rem;color:var(--slate);line-height:1.6;background:var(--pale);padding:0.9rem 1.1rem;border-radius:8px;margin-bottom:0.9rem;">${l.message}</div>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <a href="mailto:${l.email}?subject=Re: Your inquiry with Windward Properties" style="font-size:0.76rem;font-weight:700;padding:0.45rem 1rem;background:var(--mid);color:white;border-radius:6px;text-decoration:none;">✉️ Reply</a>
        ${isNew
          ? `<button onclick="markLeadContacted('${l.id}')" style="font-size:0.76rem;font-weight:700;padding:0.45rem 1rem;background:var(--success);color:white;border:none;border-radius:6px;cursor:pointer;font-family:'Nunito',sans-serif;">✓ Mark Contacted</button>`
          : `<button onclick="markLeadNew('${l.id}')" style="font-size:0.76rem;font-weight:700;padding:0.45rem 1rem;background:var(--pale);color:var(--slate);border:1.5px solid var(--border);border-radius:6px;cursor:pointer;font-family:'Nunito',sans-serif;">↩ Mark New</button>`
        }
      </div>
    </div>`;
  }).join('');
}

async function markLeadContacted(id) {
  await supabase.from('leads').update({ status: 'contacted' }).eq('id', id);
  showToast('✅ Lead marked as contacted');
  await loadEmployeeLeads();
}

async function markLeadNew(id) {
  await supabase.from('leads').update({ status: 'new' }).eq('id', id);
  await loadEmployeeLeads();
}

function doEmployeeLogout() {
  clearAutoSignout();
  const label = document.getElementById('emp-signout-label');
  if (label) label.textContent = 'Sign Out';
  if (window._adminPreviewing) {
    window._adminPreviewing = false;
    mountAdminDashboard();
    switchView('admin');
    loadAdminOverview();
  } else {
    supabase.auth.signOut();
    switchView('public');
    unmountPrivilegedViews();
  }
}

/* ═══════════════════════════════════
   PROPERTY PAGES
═══════════════════════════════════ */
const PROPERTIES = {
  carriage: {
    name: 'Carriage House Apartments',
    tag: 'Northampton, PA',
    address: '1796 Main St, Northampton, PA 18067',
    heroImg: 'northampton-1.jpg',
    photos: [
      'northampton-1.jpg',
      'northampton-2.jpg',
      'northampton-3.jpg',
      'northampton-4.jpg',
      'northampton-5.jpg'
    ],
    info: [
      { label: 'Location', val: 'Northampton Borough, PA' },
      { label: 'Available', val: '1 & 2 Bedroom Units' },
      { label: 'Pets', val: '🐱 $25/mo per cat' },
      { label: 'Parking', val: '✅ Included' },
      { label: 'Laundry', val: 'In-Unit / On-Site' },
      { label: 'Lease', val: '12 Month' }
    ],
    floorPlans: [
      { icon: '🛏', name: '1 Bedroom', specs: '1 Bed · 1 Bath · ~650 sq ft', price: '$1,250', per: '/mo' },
      { icon: '🛏🛏', name: '2 Bedroom Standard', specs: '2 Bed · 1.5 Bath · ~850 sq ft', price: '$1,550', per: '/mo' },
      { icon: '🛏🛏', name: '2 Bedroom Deluxe', specs: '2 Bed · 1.5 Bath · ~950 sq ft', price: '$1,775', per: '/mo' }
    ]
  },
  barn: {
    name: 'The Barn Apartments',
    tag: 'Northampton, PA',
    address: '1775 Franklin St, Northampton, PA 18067',
    heroImg: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1600&q=80',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
    ],
    info: [
      { label: 'Location', val: 'Northampton Borough, PA' },
      { label: 'Available', val: '1 & 2 Bedroom Units' },
      { label: 'Pets', val: '🐱 $25/mo per cat' },
      { label: 'Parking', val: '✅ Included' },
      { label: 'Laundry', val: 'On-Site' },
      { label: 'Lease', val: '12 Month' }
    ],
    floorPlans: [
      { icon: '🛏', name: '1 Bedroom', specs: '1 Bed · 1 Bath · ~700 sq ft', price: '$1,550', per: '/mo' },
      { icon: '🛏🛏', name: '2 Bedroom', specs: '2 Bed · 1.5 Bath · ~900 sq ft', price: '$1,725', per: '/mo' }
    ]
  },
  green: {
    name: 'Windward on the Green',
    tag: 'Walnutport, PA',
    address: '917 Main St, Walnutport, PA 18088',
    heroImg: 'walnutport-1.jpg',
    photos: [
      'walnutport-1.jpg',
      'walnutport-2.jpg',
      'walnutport-3.jpg',
      'walnutport-4.jpg',
      'walnutport-5.jpg'
    ],
    info: [
      { label: 'Location', val: 'Walnutport Borough, PA' },
      { label: 'Available', val: '1 & 2 Bedroom Units' },
      { label: 'Pets', val: '🐱 $25/mo per cat' },
      { label: 'Parking', val: '✅ Included' },
      { label: 'Views', val: '🌿 Green surroundings' },
      { label: 'Lease', val: '12 Month' }
    ],
    floorPlans: [
      { icon: '🛏', name: '1 Bedroom Cozy', specs: '1 Bed · 1 Bath · ~580 sq ft', price: '$950', per: '/mo' },
      { icon: '🛏', name: '1 Bedroom Standard', specs: '1 Bed · 1 Bath · ~700 sq ft', price: '$1,200', per: '/mo' },
      { icon: '🛏🛏', name: '2 Bedroom', specs: '2 Bed · 1.5 Bath · ~880 sq ft', price: '$1,250', per: '/mo' },
      { icon: '🛏🛏', name: '2 Bedroom Deluxe', specs: '2 Bed · 1.5 Bath · ~1,000 sq ft', price: '$1,450', per: '/mo' }
    ]
  }
};

function openPropertyPage(key) {
  const prop = PROPERTIES[key];
  if (!prop) return;

  // Set hero
  document.getElementById('prop-hero-img').src   = prop.heroImg;
  document.getElementById('prop-hero-tag').textContent   = prop.tag;
  document.getElementById('prop-hero-title').textContent = prop.name;
  document.getElementById('prop-hero-addr').textContent  = '📍 ' + prop.address;

  // Set nav breadcrumb title
  const navTitle = document.getElementById('prop-nav-title');
  if (navTitle) navTitle.textContent = prop.name;

  // Set sidebar
  document.getElementById('prop-sidebar-title').textContent = prop.name;
  document.getElementById('prop-sidebar-addr').textContent  = prop.address;
  document.getElementById('prop-info-rows').innerHTML = prop.info.map(r =>
    `<div class="prop-info-row"><span class="prop-info-label">${r.label}</span><span class="prop-info-val">${r.val}</span></div>`
  ).join('');

  // Set photos
  document.getElementById('prop-photos').innerHTML = prop.photos.map((src, i) =>
    `<img src="${src}" alt="Photo ${i+1}" loading="lazy">`
  ).join('');

  // Set floor plans
  document.getElementById('prop-floor-plans').innerHTML = prop.floorPlans.map(fp =>
    `<div class="floor-plan-card">
      <div class="fp-icon">${fp.icon}</div>
      <div class="fp-info">
        <div class="fp-name">${fp.name}</div>
        <div class="fp-specs">${fp.specs}</div>
      </div>
      <div class="fp-price">${fp.price}<span>${fp.per}</span></div>
    </div>`
  ).join('');

  switchView('property');
  window.scrollTo(0, 0);
}

function closePropertyPage() {
  switchView('properties');
  window.scrollTo(0, 0);
}

function switchNbh(cat, el) {
  document.querySelectorAll('.nbh-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.nbh-item').forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}
