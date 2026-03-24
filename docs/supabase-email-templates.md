# Supabase Email Templates (MCMerchant style)

Paste these into **Supabase Dashboard → Authentication → Email Templates**.

Use this shared style wrapper for each template body. Keep `{{ .ConfirmationURL }}` as the action link for template types that include it.

## Invite user

**Subject:** `You’ve been invited to MCMerchant`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">You’re invited</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 24px; color: #d4d4d8;">
    You’ve been invited to join <b>MCMerchant</b>. Accept your invite to create your account and get started.
  </p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 700; font-size: 18px; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(74,222,128,0.15);">
    Accept invite
  </a>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If you weren’t expecting this invitation, you can safely ignore this email.
  </p>
</div>
```

## Magic link

**Subject:** `Your MCMerchant magic sign-in link`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">Magic link sign-in</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 24px; color: #d4d4d8;">
    Use this one-time link to sign in to <b>MCMerchant</b> without a password.
  </p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 700; font-size: 18px; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(74,222,128,0.15);">
    Sign in now
  </a>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If you didn’t request this link, you can safely ignore this email.
  </p>
</div>
```

## Change email address

**Subject:** `Confirm your new MCMerchant email`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">Confirm your new email</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 24px; color: #d4d4d8;">
    We received a request to change your email on <b>MCMerchant</b>. Confirm this new address to finish the update.
  </p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 700; font-size: 18px; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(74,222,128,0.15);">
    Confirm new email
  </a>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If you didn’t request this change, secure your account immediately.
  </p>
</div>
```

## Reset password

**Subject:** `Reset your MCMerchant password`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">Reset your password</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 24px; color: #d4d4d8;">
    Click below to set a new password for your <b>MCMerchant</b> account.
  </p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 700; font-size: 18px; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(74,222,128,0.15);">
    Reset password
  </a>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If you didn’t request a password reset, you can ignore this email.
  </p>
</div>
```

## Reauthentication

**Subject:** `Reauthenticate your MCMerchant session`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">Confirm it’s you</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 24px; color: #d4d4d8;">
    You’re trying to perform a sensitive action. Enter this one-time code in MCMerchant to continue.
  </p>
  <div style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 800; font-size: 28px; letter-spacing: 4px; padding: 12px 22px; border-radius: 8px; margin-bottom: 24px;">
    {{ .Token }}
  </div>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If this wasn’t you, change your password right away.
  </p>
</div>
```

## Confirm signup email

**Subject:** `Confirm your MCMerchant email`

```html
<div style="font-family: Inter, Arial, sans-serif; background: #18181b; color: #f4f4f5; padding: 32px; border-radius: 16px; max-width: 480px; margin: 40px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.18);">
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/public/MCMerchantMono.png" alt="MCMerchant Logo" style="width: 64px; height: 64px; margin: 0 auto 16px;" />
    <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4ade80;">Confirm your email</h1>
  </div>
  <p style="font-size: 16px; margin-bottom: 32px; color: #d4d4d8;">
    Welcome to <b>MCMerchant</b>! Please confirm your email address to activate your account and access your dashboard.
  </p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(90deg, #4ade80 0%, #22d3ee 100%); color: #18181b; font-weight: 700; font-size: 18px; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(74,222,128,0.15);">
    Confirm email
  </a>
  <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px;">
    If you did not sign up for MCMerchant, you can safely ignore this email.
  </p>
</div>
```

## App wiring status

- **Invite user:** wired from Account Settings (`Invite user` section) via `/api/auth/invite-user`.  
- **Magic link:** now wired on `/login` via `signInWithOtp`.  
- **Change email address:** wired from Account Settings via `auth.updateUser(..., { emailRedirectTo })`.  
- **Reset password:** wired via `/forgot-password` and account security reset flow.  
- **Reauthentication:** wired in Account Settings via `auth.reauthenticate()`.

## Version-release notification behavior

Version-release emails are sent immediately when a seller publishes a new version.
No extra scheduler setup is required.

