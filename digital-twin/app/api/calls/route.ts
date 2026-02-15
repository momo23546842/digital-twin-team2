import { NextResponse } from "next/server";

// In-memory storage for calls (for demo purposes)
// In production, this should use a proper database
const callsStore: Array<{
  id: string;
  provider: string;
  status: string;
  userId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  transcript?: string | null;
  createdAt: string;
}> = [];

export async function GET() {
  try {
    return NextResponse.json({ 
      calls: callsStore.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ).slice(0, 50)
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = `call-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const provider = body.provider ?? "unknown";
    const status = body.status ?? "started";
    const userId = body.userId ?? null;
    const transcript = body.transcript ?? null;
    const startedAt = body.startedAt ?? new Date().toISOString();
    const endedAt = body.endedAt ?? null;
    const createdAt = new Date().toISOString();

    const call = {
      id,
      provider,
      status,
      userId,
      startedAt,
      endedAt,
      transcript,
      createdAt,
    };

    callsStore.push(call);

    return NextResponse.json({ call }, { status: 201 });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json(
      { error: "Failed to create call" },
      { status: 400 }
    );
  }
}

