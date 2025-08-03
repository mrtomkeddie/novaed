

// This layout no longer needs to check for authentication.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
