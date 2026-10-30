export async function POST(req: Request) {
  const data = await req.json();
  
  // Simulate a database delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In a real app, you would save this to a database here.
  console.log("💾 SAVED TO DATABASE:", data);

  return Response.json({ success: true, message: "Record saved to database successfully." });
}