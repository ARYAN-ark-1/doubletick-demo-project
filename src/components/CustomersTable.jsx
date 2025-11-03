import React, { useEffect, useRef, useState, useCallback } from "react";
import { FixedSizeList as List } from 'react-window';
 // ✅ Correct ESM import
import FiltersDropdown from "./FiltersDropdown";

// Create worker
const workerUrl = new URL("../workers/dataGenerator.worker.js", import.meta.url);

const TOTAL = 1_000_000; // 1M
const BATCH_SIZE = 10000; // Records per batch

// Small util for caret
function Caret({ dir }) {
  return (
    <span className="caret" aria-hidden>
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "⬍"}
    </span>
  );
}

export default function CustomersTable() {
  const [workerReady, setWorkerReady] = useState(false);
  const workerRef = useRef(null);

  // local storage of records that have been received from worker
  const recordsRef = useRef(new Array(TOTAL));
  const [generated, setGenerated] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  // indexList determines which indices to show (search/sort modify it)
  const [indexList, setIndexList] = useState(null);
  const indexListRef = useRef(null);

  // sorting and search states
  const [sortState, setSortState] = useState({ field: null, dir: null });
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);

  const ROW_HEIGHT = 58;
  const HEIGHT = 720;
  const listRef = useRef();

  // Start worker on mount
  useEffect(() => {
    const w = new Worker(workerUrl, { type: "module" });
    workerRef.current = w;

    w.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg) return;

      switch (msg.type) {
        case "progress":
          setGenerated(msg.generated);
          setProgressPct(Math.round((msg.generated / msg.total) * 100));
          break;

        case "batch":
          const start = msg.start;
          for (let i = 0; i < msg.records.length; i++) {
            recordsRef.current[start + i] = msg.records[i];
          }
          break;

        case "done":
          setWorkerReady(true);
          setIndexList(null);
          indexListRef.current = null;
          break;

        case "searchResult":
        case "sortResult":
          setIndexList(msg.indices);
          indexListRef.current = msg.indices;
          if (listRef.current) listRef.current.scrollToItem(0);
          break;

        case "record":
          const idx = msg.index;
          recordsRef.current[idx] = msg.record;
          break;

        default:
          break;
      }
    };

    // Start generation
    w.postMessage({ type: "start", total: TOTAL, batchSize: BATCH_SIZE });

    return () => {
      w.terminate();
    };
  }, []);

  // Helper to request search (debounced)
  const doSearch = useCallback((q) => {
    if (!workerRef.current) return;
    workerRef.current.postMessage({ type: "search", query: q });
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      doSearch(searchTerm);
    }, 250);

    return () => clearTimeout(searchTimeout.current);
  }, [searchTerm, doSearch]);

  // Handle sorting
  const handleSort = (field) => {
    let nextDir = "asc";
    if (sortState.field === field) {
      if (sortState.dir === "asc") nextDir = "desc";
      else if (sortState.dir === "desc") nextDir = null;
      else nextDir = "asc";
    }
    const newSort = { field: nextDir ? field : null, dir: nextDir };
    setSortState(newSort);

    if (!nextDir) {
      // Clear sort → reset to current search result or default
      if (searchTerm.trim().length > 0) {
        workerRef.current.postMessage({ type: "search", query: searchTerm });
      } else {
        setIndexList(null);
        indexListRef.current = null;
      }
      return;
    }

    workerRef.current.postMessage({ type: "sort", field, dir: nextDir });
  };

  // Get item count
  const getItemCount = () => {
    if (Array.isArray(indexListRef.current)) return indexListRef.current.length;
    return TOTAL;
  };

  // Map visible list index to actual record index
  const mapToRecordIndex = (visibleIndex) => {
    if (Array.isArray(indexListRef.current)) {
      return indexListRef.current[visibleIndex];
    }
    return visibleIndex;
  };

  // Row renderer
  const Row = ({ index, style }) => {
    const realIdx = mapToRecordIndex(index);
    const r = recordsRef.current[realIdx];

    return (
      <div className="row" style={style} role="row" key={index}>
        <div className="col avatar-col">
          {r ? (
            <img
              src={r.avatar}
              alt={r.name}
              className="avatar"
              style={{ width: 40, height: 40 }}
            />
          ) : (
            <div className="avatar placeholder" />
          )}
        </div>

        <div className="col name">
          {r ? <div className="primary">{r.name}</div> : <div className="placeholder" />}
          {r ? (
            <div className="secondary small">{r.addedBy}</div>
          ) : (
            <div style={{ height: 6 }} />
          )}
        </div>

        <div className="col small">{r ? r.phone : <div className="placeholder" />}</div>
        <div className="col small">{r ? r.email : <div className="placeholder" />}</div>
        <div className="col small">{r ? r.score.toFixed(2) : <div className="placeholder" />}</div>
        <div className="col small">
          {r ? new Date(r.lastMessageAt).toLocaleString() : <div className="placeholder" />}
        </div>
        <div className="col small">{r ? r.id : <div className="placeholder" />}</div>
      </div>
    );
  };

  // Header
  const HeaderRow = () => (
    <div className="table-header" role="row">
      <div className="col">Avatar</div>
      <div className="col" onClick={() => handleSort("name")}>
        Name {sortState.field === "name" && <Caret dir={sortState.dir} />}
      </div>
      <div className="col" onClick={() => handleSort("phone")}>
        Phone {sortState.field === "phone" && <Caret dir={sortState.dir} />}
      </div>
      <div className="col" onClick={() => handleSort("email")}>
        Email {sortState.field === "email" && <Caret dir={sortState.dir} />}
      </div>
      <div className="col" onClick={() => handleSort("score")}>
        Score {sortState.field === "score" && <Caret dir={sortState.dir} />}
      </div>
      <div className="col" onClick={() => handleSort("lastMessageAt")}>
        Last Message{" "}
        {sortState.field === "lastMessageAt" && <Caret dir={sortState.dir} />}
      </div>
      <div className="col">ID</div>
    </div>
  );

  // UI
  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <input
            type="search"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>
            {searchTerm
              ? `Searching: "${searchTerm}"`
              : workerReady
              ? "Ready"
              : "Generating..."}
          </div>
        </div>

        <div className="filters">
          <FiltersDropdown />
        </div>
      </div>

      <div className="table-card">
        <HeaderRow />

        {!workerReady && (
          <div style={{ padding: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 240 }}>
                <div className="progress" aria-hidden>
                  <div style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                {generated.toLocaleString()} / {TOTAL.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <List
          height={HEIGHT}
          itemCount={getItemCount()}
          itemSize={ROW_HEIGHT}
          width="100%"
          ref={listRef}
        >
          {Row}
        </List>

        <div className="footer">
          Showing {Math.min(getItemCount(), TOTAL).toLocaleString()} rows.
          &nbsp;•&nbsp;Generated: {generated.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
