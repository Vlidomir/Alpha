import { requireServerSession } from "@/lib/server-auth";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const session = await requireServerSession();

  return <DashboardClient userName={session.user.name} />;
}
