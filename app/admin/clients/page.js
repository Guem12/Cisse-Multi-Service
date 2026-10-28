import ClientList from "@/components/admin/ClientList";
import { getClients } from "@/lib/clients";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clients · Administration Cissé Multi-Service",
};

export default async function AdminClientsPage() {
  const clients = await getClients();
  return <ClientList initialClients={clients} />;
}
