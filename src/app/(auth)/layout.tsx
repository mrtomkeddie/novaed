
// This layout is no longer used and can be safely deleted.
// We return children directly to avoid any redirects.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
