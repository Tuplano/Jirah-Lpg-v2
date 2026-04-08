"use client";

import * as React from "react";
import { LpgSize } from "@/types";
import { useLpgSizes } from "@/hooks/use-settings";
import { LpgSizesSection } from "@/components/settings/lpg-sizes-section";

interface SettingsViewProps {
  initialLpgSizes: LpgSize[];
}

interface SettingsSectionConfig {
  id: string;
  content: React.ReactNode;
}

export function SettingsView({ initialLpgSizes }: SettingsViewProps) {
  const { data: lpgSizes, isLoading } = useLpgSizes();

  if (isLoading && !initialLpgSizes) {
    return <div className="p-8 text-center text-muted-foreground">Loading catalog...</div>;
  }

  const sizes = lpgSizes || initialLpgSizes;
  const settingsSections: SettingsSectionConfig[] = [
    {
      id: "lpg-sizes",
      content: <LpgSizesSection sizes={sizes} />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage LPG catalog and pricing.</p>
      </div>
      {settingsSections.map((section) => (
        <React.Fragment key={section.id}>{section.content}</React.Fragment>
      ))}
    </div>
  );
}
