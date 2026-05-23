import { Client, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BILLS = process.env.NEXT_PUBLIC_APPWRITE_BILLS_COLLECTION!;
const PARTICIPANTS = process.env.NEXT_PUBLIC_APPWRITE_PARTICIPANTS_COLLECTION!;

export interface Bill {
  $id: string;
  title: string;
  total_amount: number;
  description?: string;
  due_date?: string;
  slug: string;
  organizer_name?: string;
  participant_count: number;
  created_at?: string;
}

export interface Participant {
  $id: string;
  bill_id: string;
  name: string;
  has_paid: boolean;
  paid_at?: string;
  paid_amount?: number;
}

export async function createBill(data: {
  title: string;
  total_amount: number;
  description?: string;
  due_date?: string;
  organizer_name?: string;
  participant_count: number;
  participants: string[];
}): Promise<{ bill: Bill; participants: Participant[] }> {
  const slug = generateSlug();

  const bill = await databases.createDocument(DB, BILLS, ID.unique(), {
    title: data.title,
    total_amount: data.total_amount,
    description: data.description || "",
    due_date: data.due_date || "",
    slug,
    organizer_name: data.organizer_name || "",
    participant_count: data.participant_count,
    created_at: new Date().toISOString(),
  });

  const participants = await Promise.all(
    data.participants.map((name) =>
      databases.createDocument(DB, PARTICIPANTS, ID.unique(), {
        bill_id: bill.$id,
        name,
        has_paid: false,
        paid_at: "",
        paid_amount: 0,
      })
    )
  );

  return {
    bill: bill as unknown as Bill,
    participants: participants as unknown as Participant[],
  };
}

export async function getBillBySlug(
  slug: string
): Promise<{ bill: Bill; participants: Participant[] } | null> {
  const result = await databases.listDocuments(DB, BILLS, [
    Query.equal("slug", slug),
    Query.limit(1),
  ]);

  if (result.documents.length === 0) return null;

  const bill = result.documents[0] as unknown as Bill;
  const participantsResult = await databases.listDocuments(DB, PARTICIPANTS, [
    Query.equal("bill_id", bill.$id),
    Query.limit(100),
  ]);

  return {
    bill,
    participants: participantsResult.documents as unknown as Participant[],
  };
}

export async function markAsPaid(
  participantId: string,
  amount: number
): Promise<Participant> {
  const result = await databases.updateDocument(
    DB,
    PARTICIPANTS,
    participantId,
    {
      has_paid: true,
      paid_amount: amount,
      paid_at: new Date().toISOString(),
    }
  );

  return result as unknown as Participant;
}

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}
