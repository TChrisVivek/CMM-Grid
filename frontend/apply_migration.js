import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const sql = "ALTER TABLE projects ADD COLUMN IF NOT EXISTS electrical_plans JSONB DEFAULT '[]'::jsonb;";
  
  try {
    const res = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!res.ok) {
      console.error("Failed:", await res.text());
    } else {
      console.log("Success:", await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

run();
