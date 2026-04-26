import { createBrowserClient } from "@supabase/ssr";

const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const RAW_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isValid =
  RAW_URL.startsWith("http") && !RAW_URL.includes("placeholder") && !RAW_URL.includes("your_");

const SUPABASE_URL = isValid ? RAW_URL : "https://placeholder.supabase.co";
const SUPABASE_KEY = isValid ? RAW_KEY : "placeholder-key";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
