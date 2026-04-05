import { SettingsView } from "@/components/settings/settings-view";
import { getAllLpgSizes } from "@/services/lpg-size-service";

export default async function SettingsPage() {
  const lpgSizes = await getAllLpgSizes();
  return <SettingsView initialLpgSizes={lpgSizes} />;
}

