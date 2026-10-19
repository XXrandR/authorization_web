import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminResource } from "@/components/admin/resource";

const sections = [
  "clients",
  "identities",
  "roles",
  "invitations",
  "authorizations",
  "browser-sessions",
  "audit-events",
  "access-events",
];

export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}

export default function ResourcePage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading resource...</p>}>
      <ResourceContent params={params} />
    </Suspense>
  );
}

async function ResourceContent({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!sections.includes(section as (typeof sections)[number])) {
    notFound();
  }

  return <AdminResource resource={section} />;
}