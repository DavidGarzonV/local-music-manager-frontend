import React from 'react';

type MessageTemplateProps = {
  icon: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  children: React.ReactNode;
};

export default function MessageTemplate({
  icon,
  children,
  severity,
}: MessageTemplateProps) {
  return (
    <div className="flex flex-row align-items-start w-full">
      <i
        className={`pi ${icon} mr-3 mt-auto mb-auto`}
        style={{
          color: severity === 'success' ? 'var(--green-300)' : '',
          fontSize: '1.5rem',
        }}
      />
      <div className="flex flex-column align-items-start">{children}</div>
    </div>
  );
}
