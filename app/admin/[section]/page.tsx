import { AdminResource } from "@/components/admin/resource";

export async function generateStaticParams() {
  return [
    "clients",
    "identities",
    "roles",
    "invitations",
    "authorizations",
    "browser-sessions",
    "audit-events",
    "access-events",
  ].map((section) => ({ section }));
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <AdminResource resource={section} />;
}
