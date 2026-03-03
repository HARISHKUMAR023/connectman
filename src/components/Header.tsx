export default function Header() {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-card">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Server Manager</h2>
        <p className="text-xs text-text-secondary mt-1">Manage SSH connections organized by collections</p>
      </div>
    </div>
  )
}
