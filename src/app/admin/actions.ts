'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/shared/infrastructure/supabase/server';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/signin');
}
