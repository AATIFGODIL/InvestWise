import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";

export default function CommunityPage() {
  return (
    <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-4 pb-40">
        <h1 className="text-2xl font-bold">Community</h1>
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">The community page is coming soon!</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
