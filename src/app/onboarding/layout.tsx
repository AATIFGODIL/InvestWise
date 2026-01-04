
// This layout is for the onboarding and authentication process.
// It's a simple pass-through without the main app's header or nav.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
