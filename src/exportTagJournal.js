import { REFERENCE_GROUPS, REFERENCE_TAGS } from "./tagJournalReference";

const API_URL = "https://walak.vercel.app/api/logs";
const PAGE_LIMIT = 500;
const MAX_PAGES = 50;

export async function fetchAllLogs() {
    const all = [];
    const seen = new Set();
    for (let page = 1; page <= MAX_PAGES; page++) {
        const res = await fetch(`${API_URL}?page=${page}&limit=${PAGE_LIMIT}`);
        if (!res.ok) {
            const body = await res.text().catch(() => "");
            const err = new Error(`Failed to load logs: ${res.status} ${res.statusText}`);
            err.status = res.status;
            err.body = body;
            throw err;
        }
        const batch = await res.json();
        if (!Array.isArray(batch) || batch.length === 0) break;

        let added = 0;
        for (const item of batch) {
            const key = item._id ?? JSON.stringify(item);
            if (seen.has(key)) continue;
            seen.add(key);
            all.push(item);
            added++;
        }
        // Backend likely ignored pagination and returned the full set.
        if (added === 0) break;
        if (batch.length < PAGE_LIMIT) break;
    }
    return all;
}

const dayKey = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const titleCase = (s) =>
    s.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

const shortId = () => Math.random().toString(36).slice(2, 10);

export function buildTagJournalExport(logs) {
    const groupByLowerName = new Map(
        REFERENCE_GROUPS.map(g => [g.name.toLowerCase(), g.id])
    );
    const fallbackGroupId = REFERENCE_GROUPS[0].id;
    const categoryToGroupId = (category) =>
        groupByLowerName.get((category ?? "").toLowerCase()) ?? fallbackGroupId;

    const tags = REFERENCE_TAGS.map(t => ({ ...t }));
    const tagByLowerName = new Map(tags.map(t => [t.name.toLowerCase(), t]));

    const resolveTag = (block) => {
        const rawName = (block.name ?? "").trim();
        if (!rawName) return null;
        const key = rawName.toLowerCase();
        const existing = tagByLowerName.get(key);
        if (existing) return existing;
        const created = {
            id: shortId(),
            name: titleCase(rawName),
            groupId: categoryToGroupId(block.category),
        };
        tags.push(created);
        tagByLowerName.set(key, created);
        return created;
    };

    const sorted = [...logs].sort((a, b) => {
        const ta = new Date(a.date).getTime();
        const tb = new Date(b.date).getTime();
        return ta - tb;
    });

    const logsByDate = {};
    const usage = {};

    for (const block of sorted) {
        const date = dayKey(block.date);
        if (!date) continue;
        const tag = resolveTag(block);
        if (!tag) continue;

        const parts = [`@${tag.name}`];
        if (block.note && block.note.trim()) parts.push(block.note.trim());
        if (block.thought && block.thought.trim()) parts.push(block.thought.trim());
        const entry = parts.join(" ");

        logsByDate[date] = logsByDate[date]
            ? `${logsByDate[date]}\n\n${entry}`
            : entry;

        if (!usage[date]) usage[date] = {};
        usage[date][tag.id] = (usage[date][tag.id] ?? 0) + 1;
    }

    const orderedDates = Object.keys(logsByDate).sort((a, b) => (a < b ? 1 : -1));
    const logsOrdered = {};
    const usageOrdered = {};
    for (const d of orderedDates) {
        logsOrdered[d] = logsByDate[d];
        usageOrdered[d] = usage[d];
    }

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        logs: logsOrdered,
        tags,
        groups: REFERENCE_GROUPS.map(g => ({ ...g })),
        usage: usageOrdered,
    };
}

export function triggerDownload(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function defaultExportFilename(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `tagjournal-backup-${yyyy}${mm}${dd}.json`;
}
