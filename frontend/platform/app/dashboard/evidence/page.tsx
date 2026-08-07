import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { db } from "../../../lib/db";
import IngestForm from "./IngestForm";

export default async function EvidencePage() {
  const session = await auth();
  if (!session?.user?.activeOrgId) redirect("/dashboard/onboarding");

  const documents = await db.document.findMany({
    where: { organizationId: session.user.activeOrgId },
    include: { source: true, jobs: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <header>
        <h1>Evidence Base</h1>
        <IngestForm />
      </header>

      <div style={{ marginTop: "24px" }}>
        {documents.length === 0 ? (
          <div className="hero-card">
            <p>Your evidence base is empty. Add documents to improve verification grounding.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)", fontSize: "12px" }}>
                <th style={{ padding: "12px 0" }}>Title</th>
                <th style={{ padding: "12px 0" }}>Source</th>
                <th style={{ padding: "12px 0" }}>Status</th>
                <th style={{ padding: "12px 0" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const latestJob = doc.jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
                return (
                  <tr key={doc.id} style={{ borderBottom: "1px solid var(--line)", fontSize: "14px" }}>
                    <td style={{ padding: "12px 0", fontWeight: 700 }}>{doc.title}</td>
                    <td style={{ padding: "12px 0", color: "var(--teal)" }}>{doc.source.name}</td>
                    <td style={{ padding: "12px 0" }}>
                      <span className={`verdict ${latestJob?.status === "completed" ? "grounded" : "flagged"}`}>
                        {latestJob?.status || "unknown"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 0", color: "var(--muted)" }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
