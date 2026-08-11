import { createClient } from "./server";

export async function testSupabaseConnection() {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  return error;
}