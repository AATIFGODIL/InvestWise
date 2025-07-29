
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, getDocs, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Header from "@/components/layout/header";
import BottomNav from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ExploreItem extends DocumentData {
  id: string;
  title: string;
  description: string;
}

export default function DashboardPage() {
  const { hydrating: authLoading } = useAuth();
  const [content, setContent] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExploreData = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "explore"));
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ExploreItem[];
        setContent(items);
      } catch (error) {
        console.error("Error fetching explore data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchExploreData();
    }
  }, [authLoading]);
  
  const PageSkeleton = () => (
     <div className="w-full bg-background font-body">
      <Header />
      <main className="p-4 space-y-4 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      </main>
      <BottomNav />
    </div>
  )

  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="w-full bg-background font-body">
        <Header />
        <main className="p-4 space-y-4 pb-40">
             <h1 className="text-2xl font-bold">Explore</h1>
            {content.length === 0 ? (
                <div className="text-center py-10">
                    <p>No explore data available.</p>
                    <p className="text-sm text-muted-foreground">Please add documents to the 'explore' collection in Firestore.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </main>
        <BottomNav />
    </div>
  );
}
