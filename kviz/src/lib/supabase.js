// Kviz i društvena mreža koriste isti Supabase klijent, sesiju i autentifikaciju.
// Tako se korisnik prijavljuje jednom i ostaje prijavljen u oba dijela aplikacije.
export { supabase, isSupabaseConfigured } from "../../../src/lib/supabase.js";
