// src/workers/dataGenerator.worker.js
import { faker } from '@faker-js/faker';

/**
 * Worker responsibilities:
 * - Generate N records in batches, store them in `records` locally (worker memory).
 * - Post 'batch' messages to main thread to stream data for rendering/storage.
 * - Respond to 'search' and 'sort' requests from the main thread by returning arrays of indices.
 *
 * Messages to worker:
 *  - { type: 'start', total: number, batchSize: number }
 *  - { type: 'search', query: string }  -> returns { type: 'searchResult', indices: [...] }
 *  - { type: 'sort', field: 'name'|'email'|'phone'|'score'|'lastMessageAt', dir: 'asc'|'desc' } -> returns { type: 'sortResult', indices: [...] }
 *
 * Messages from worker:
 *  - { type: 'progress', generated: n, total }
 *  - { type: 'batch', start, records: [...] }
 *  - { type: 'done', total }
 *  - { type: 'searchResult', indices }
 *  - { type: 'sortResult', indices }
 */

let records = []; // master copy in worker
let totalRecords = 0;

function makeRecord(id) {
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  const name = `${first} ${last}`;
  const email = faker.internet.email({ firstName: first, lastName: last }).toLowerCase();
  const phone = faker.phone.number('+91-9##-###-####'); // Indian style for demo
  const score = Math.floor(Math.random() * 10001) / 100; // 0.00 - 100.00
  const lastMessageAt = faker.date.recent({ days: 365 }).toISOString();
  const addedBy = `${faker.person.firstName()} ${faker.person.lastName()}`;
  const avatar = faker.image.avatar(); // url for avatar (may be placeholder)
  return {
    id,
    name,
    email,
    phone,
    score,
    lastMessageAt,
    addedBy,
    avatar
  };
}

self.onmessage = async (ev) => {
  const msg = ev.data;
  if (msg?.type === 'start') {
    const total = msg.total ?? 1000000;
    const batchSize = msg.batchSize ?? 10000;
    totalRecords = total;
    records = new Array(total);
    let generated = 0;

    // Stream batches (synchronous generation but inside worker)
    for (let start = 0; start < total; start += batchSize) {
      const end = Math.min(start + batchSize, total);
      const batch = [];
      for (let i = start; i < end; i++) {
        const rec = makeRecord(i + 1);
        batch.push(rec);
        records[i] = rec;
      }
      generated = end;
      // post the batch to main thread
      self.postMessage({ type: 'batch', start, records: batch });
      self.postMessage({ type: 'progress', generated, total });
      // allow the event loop a tiny pause (yields) -- not strictly necessary in worker but keeps it responsive
      await new Promise(r => setTimeout(r, 0));
    }

    self.postMessage({ type: 'done', total });
  } else if (msg?.type === 'search') {
    const q = (msg.query ?? '').trim().toLowerCase();
    if (!q) {
      // empty query -> return full index list
      const allIndices = Array.from({ length: records.length }, (_, i) => i);
      self.postMessage({ type: 'searchResult', indices: allIndices });
      return;
    }
    // Search name/email/phone partial match
    const result = [];
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (!r) continue;
      if (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
      ) {
        result.push(i);
      }
    }
    self.postMessage({ type: 'searchResult', indices: result });
  } else if (msg?.type === 'sort') {
    const field = msg.field;
    const dir = msg.dir === 'desc' ? -1 : 1;
    // Build indices array and sort based on the field
    const indices = [];
    for (let i = 0; i < records.length; i++) {
      if (records[i]) indices.push(i);
    }

    indices.sort((a, b) => {
      const A = records[a];
      const B = records[b];
      if (!A || !B) return 0;
      let va = A[field], vb = B[field];
      // normalize for dates and strings
      if (field === 'score') {
        va = Number(va);
        vb = Number(vb);
      } else if (field === 'lastMessageAt') {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    self.postMessage({ type: 'sortResult', indices });
  } else if (msg?.type === 'getRecord') {
    const idx = msg.index;
    const r = records[idx] ?? null;
    self.postMessage({ type: 'record', index: idx, record: r });
  }
};
