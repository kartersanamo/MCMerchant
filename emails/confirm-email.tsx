import * as React from "react";

export default function ConfirmEmail({ confirmUrl }: { confirmUrl: string }) {
  return (
    <div style={{
      fontFamily: 'Inter, Arial, sans-serif',
      background: '#18181b',
      color: '#f4f4f5',
      padding: 32,
      borderRadius: 16,
      maxWidth: 480,
      margin: '40px auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="https://raw.githubusercontent.com/kartersanamo/MCMerchant/main/MCMerchant/MCMerchant/public/MCMerchantMono.png" alt="MCMerchant Logo" style={{ width: 64, height: 64, margin: '0 auto 16px' }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#4ade80' }}>Confirm your email</h1>
      </div>
      <p style={{ fontSize: 16, marginBottom: 32, color: '#d4d4d8' }}>
        Welcome to <b>MCMerchant</b>! Please confirm your email address to activate your account and access your dashboard.
      </p>
      <a
        href={confirmUrl}
        style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #4ade80 0%, #22d3ee 100%)',
          color: '#18181b',
          fontWeight: 700,
          fontSize: 18,
          padding: '16px 32px',
          borderRadius: 8,
          textDecoration: 'none',
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(74,222,128,0.15)'
        }}
      >
        Confirm Email
      </a>
      <p style={{ fontSize: 13, color: '#a1a1aa', marginTop: 32 }}>
        If you did not sign up for MCMerchant, you can safely ignore this email.
      </p>
    </div>
  );
}
