import LogoutButton from './LogoutButton';

interface AdminHeaderProps {
  title?: string;
}

export default function AdminHeader({ title = 'Dashboard Overview' }: AdminHeaderProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-8 sticky top-0 z-10"
      style={{
        background: 'rgba(255,255,255,0.5)',
        borderBottom: '1px solid rgba(0,0,128,0.05)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h2 className="text-xl font-bold text-[#000080] font-eluo">{title}</h2>
      <div className="flex items-center gap-6">

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
