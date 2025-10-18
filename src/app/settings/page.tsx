
"use client";

import SettingsClient from "@/components/settings/page";
import AppLayout from "@/components/layout/app-layout";

export default function SettingsPage() {
    return (
        <AppLayout variant="lightweight">
            <SettingsClient />
        </AppLayout>
    )
}
