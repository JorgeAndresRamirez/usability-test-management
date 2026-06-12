import { PresentationClient } from "@/components/participant/PresentationClient";

type PageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function PresentationPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { sessionId } = await searchParams;

  return <PresentationClient token={token} sessionId={sessionId} />;
}
