// Sağlayıcı-bağımsız Postgres katmanı.
// @vercel/postgres (Neon'a kilitli) yerine standart bir bağlantı: DATABASE_URL ile
// Supabase / kendi VPS'in / herhangi bir Postgres çalışır. Böylece bir daha sağlayıcıya
// kilitlenmeyiz — DB değişince yalnızca DATABASE_URL değişir.
//
// @vercel/postgres UYUMLULUĞU: kod `sql`...`` tagged-template kullanıyor ve sonucu
// `.rows` ile okuyor + login.js `sql.query(text)` çağırıyor. İkisi de burada karşılanır.
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error('[DB] DATABASE_URL / POSTGRES_URL tanımlı değil!');
}

// Supabase "Transaction pooler" (port 6543) prepared statement DESTEKLEMEZ → prepare:false şart.
// Serverless olduğu için küçük havuz + kısa idle.
const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 15,
});

function wrap(result) {
  // porsager sonucu dizi-benzeri; @vercel/postgres gibi {rows, rowCount} döndür.
  return { rows: Array.from(result), rowCount: result.count ?? result.length };
}

// Tagged-template: sql`SELECT ... ${x}`  → Promise<{rows}>
export function sql(strings, ...values) {
  return client(strings, ...values).then(wrap);
}

// Ham sorgu: sql.query('ALTER TABLE ...')  (login.js migration döngüsü)
sql.query = (text, params = []) => client.unsafe(text, params).then(wrap);

// Nadiren gerekebilecek doğrudan istemci erişimi.
export { client };
