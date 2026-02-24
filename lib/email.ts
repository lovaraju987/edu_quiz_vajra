import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
  });
}

// ─────────────────────────────────────────────
// EMAIL 1: Admin approves a school → send invite
// ─────────────────────────────────────────────
export async function sendInvitationEmail(to: string, schoolName: string): Promise<void> {
  const transport = getTransporter();
  const registerUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/faculty/login`;

  await transport.sendMail({
    from: `"EduQuiz World" <${process.env.EMAIL_USER}>`,
    to,
    subject: '✅ Your School is Approved — Complete Registration on EduQuiz',
    html: `
<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,46,93,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#002e5d,#1e40af);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-1px;">Edu<span style="color:#f87171;">Quiz</span></h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">Faculty Portal</p>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="margin:0 0 6px;color:#16a34a;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">✅ Approved by Administrator</p>
    <h2 style="margin:0 0 14px;color:#0f172a;font-size:20px;font-weight:800;">Welcome, ${schoolName}!</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
      Your school email <strong>${to}</strong> has been <strong>approved</strong> by EduQuiz admin. 
      You can now create your school account and start using the platform.
    </p>

    <!-- Steps Box -->
    <div style="background:#f1f5f9;border-radius:12px;padding:18px 20px;margin:0 0 22px;">
      <p style="margin:0 0 10px;color:#0f172a;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">How to Register (3 Steps):</p>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">1️⃣ Click <strong>"Register Your School"</strong> button below</p>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">2️⃣ Click <strong>"Create School Account"</strong> on the page</p>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;">3️⃣ Fill your details → enter OTP sent to this email</p>
      <p style="margin:0;color:#16a34a;font-size:14px;font-weight:700;">✅ Done — your school account will be created!</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:0 0 20px;">
      <a href="${registerUrl}" style="display:inline-block;padding:14px 36px;background:#002e5d;color:#fff;font-size:15px;font-weight:800;text-decoration:none;border-radius:12px;">
        Register Your School →
      </a>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Use <strong>${to}</strong> as your email during registration.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:14px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 EduQuiz World • Telangana, India</p>
  </div>

</div>
</body></html>`,
  });
}

// ─────────────────────────────────────────────
// EMAIL 2: School clicks "Send Verification OTP" while registering
// ─────────────────────────────────────────────
export async function sendRegistrationOTPEmail(to: string, otp: string, name: string): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: `"EduQuiz World" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔐 Verify Your Email — Complete EduQuiz School Registration',
    html: `
<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,46,93,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#002e5d,#1e40af);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-1px;">Edu<span style="color:#f87171;">Quiz</span></h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">School Registration</p>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="margin:0 0 6px;color:#2563eb;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Step 2 of 2 — Email Verification</p>
    <h2 style="margin:0 0 14px;color:#0f172a;font-size:20px;font-weight:800;">Hello, ${name} 👋</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
      You're almost done! Enter the OTP below on the registration page to 
      <strong>complete your school account creation</strong>.
    </p>

    <!-- OTP Box -->
    <div style="background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:22px;text-align:center;margin:0 0 20px;">
      <p style="margin:0 0 8px;color:#1d4ed8;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Registration OTP</p>
      <div style="font-size:44px;font-weight:900;letter-spacing:12px;color:#002e5d;font-family:'Courier New',monospace;">${otp}</div>
      <p style="margin:10px 0 0;color:#f97316;font-size:12px;font-weight:700;">⏱ Expires in 10 minutes</p>
    </div>

    <!-- What happens next -->
    <div style="background:#f0fdf4;border-left:4px solid #4ade80;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;color:#166534;font-size:13px;font-weight:700;">
        ✅ After entering this OTP, your school account will be created and you can login immediately.
      </p>
    </div>

    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Did not try to register? Ignore this email — no account will be created.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:14px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 EduQuiz World • Telangana, India</p>
  </div>

</div>
</body></html>`,
  });
}

// ─────────────────────────────────────────────
// EMAIL 3: School clicks "Forgot Password"
// ─────────────────────────────────────────────
export async function sendOTPEmail(to: string, otp: string, name: string): Promise<void> {
  const transport = getTransporter();

  await transport.sendMail({
    from: `"EduQuiz World" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Reset Your EduQuiz Password — OTP Inside',
    html: `
<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,46,93,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:26px;font-weight:900;letter-spacing:-1px;">Edu<span style="color:#f87171;">Quiz</span></h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;">Password Reset</p>
  </div>

  <!-- Body -->
  <div style="padding:32px;">
    <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Password Reset Request</p>
    <h2 style="margin:0 0 14px;color:#0f172a;font-size:20px;font-weight:800;">Hello, ${name} 👋</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.7;">
      We received a request to <strong>reset your EduQuiz school account password</strong>. 
      Enter this OTP on the verification page to proceed.
    </p>

    <!-- OTP Box -->
    <div style="background:#faf5ff;border:2px dashed #c4b5fd;border-radius:12px;padding:22px;text-align:center;margin:0 0 20px;">
      <p style="margin:0 0 8px;color:#7c3aed;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Password Reset OTP</p>
      <div style="font-size:44px;font-weight:900;letter-spacing:12px;color:#4f46e5;font-family:'Courier New',monospace;">${otp}</div>
      <p style="margin:10px 0 0;color:#f97316;font-size:12px;font-weight:700;">⏱ Expires in 10 minutes</p>
    </div>

    <!-- What happens next -->
    <div style="background:#fdf4ff;border-left:4px solid #c084fc;border-radius:0 8px 8px 0;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;color:#6b21a8;font-size:13px;font-weight:700;">
        🔑 After entering this OTP, you'll be able to set a new password for your account.
      </p>
    </div>

    <!-- Security warning -->
    <div style="background:#fef2f2;border-left:4px solid #f87171;border-radius:0 8px 8px 0;padding:12px 16px;">
      <p style="margin:0;color:#991b1b;font-size:12px;font-weight:700;">
        🔒 Never share this OTP with anyone. If you did not request this, ignore this email — your account is safe.
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:14px 32px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 EduQuiz World • Telangana, India</p>
  </div>

</div>
</body></html>`,
  });
}
