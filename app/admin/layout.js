import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Administration · Cissé Multi-Service",
  robots: { index: false },
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
