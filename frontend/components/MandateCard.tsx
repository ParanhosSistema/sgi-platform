// frontend/components/MandateCard.tsx
import React from 'react';

type Mandate = {
  name: string;
  role: 'PREFEITO' | 'VICE_PREFEITO' | 'VEREADOR';
  party?: string | null;
  photoUrl?: string | null;
};

export default function MandateCard({ name, role, party, photoUrl }: Mandate) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <img
        src={photoUrl || '/placeholder-avatar.png'}
        alt={name}
        width={56}
        height={56}
        style={{ borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-avatar.png'; }}
      />
      <div>
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>{role.replace('_',' ')} {party ? `• ${party}` : ''}</div>
      </div>
    </div>
  );
}
