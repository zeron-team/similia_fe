const BASE = import.meta.env.VITE_API || "http://localhost:8088";

export interface Document {
  id: string;
  folder: string;
  filename: string;
  originalFilename: string;
  size: number;
  ext: string;
  updatedAt: string;
}

export async function uploadDoc(id: string, folder: string, originalFilename: string, file: File) {
  const fd = new FormData();
  fd.append("id", id);
  fd.append("folder", folder);
  fd.append("originalFilename", originalFilename);
  fd.append("file", file);
  const res = await fetch(`${BASE}/documents/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDocs(): Promise<Document[]> {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getDocIDs(): Promise<string[]> {
  const res = await fetch(`${BASE}/documents/ids`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFolders(): Promise<string[]> {
  const res = await fetch(`${BASE}/folders`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteDoc(id: string) {
  const res = await fetch(`${BASE}/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export interface MatchingSegment {
  textA: string;
  textB: string;
  score: number;
}

export interface JaccardResult {
	intersection: number;
	union:        number;
	score:        number;
}

export interface CosineTFIDFResult {
	dot:   number;
	na2:   number;
	nb2:   number;
	score: number;
}

export interface CompareResult {
	doc1TextContentLength: number;
	doc2TextContentLength: number;
	doc1TokensLength:      number;
	doc2TokensLength:      number;
	doc1ShinglesLength:    number;
	doc2ShinglesLength:    number;
	jaccard:               JaccardResult;
	cosine:                CosineTFIDFResult;
	nearDuplicate:         number;
	topicSimilarity:       number;
	final:                 number;
	matchingSegments:      MatchingSegment[];
    nearDuplicatePercent: number;
    topicSimilarityPercent: number;
    finalPercent: number;
}

export async function compare(id1: string, id2: string): Promise<CompareResult> {
  const res = await fetch(`${BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ID1: id1, ID2: id2 }),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return {
      ...result,
      nearDuplicatePercent: result.nearDuplicate * 100,
      topicSimilarityPercent: result.topicSimilarity * 100,
      finalPercent: result.final * 100,
  };
}

export async function similar(id: string, topK = 10) {
  const res = await fetch(`${BASE}/similar/${id}?topK=${topK}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<Array<{ id: string; finalPercent: number; nearDuplicatePercent: number; topicSimilarityPercent: number }>>;
}

export interface User {
    id:       string;
    name:     string;
    lastName: string;
    username: string;
    email:    string;
}

export async function login(username, password) {
    const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

function getAuthHeader() {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

export async function getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE}/admin/users`, {
        headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function createUser(user) {
    console.log("API createUser request:", user);
    const res = await fetch(`${BASE}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(user),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API createUser error:", errorText);
        throw new Error(errorText);
    }
    const result = await res.json();
    console.log("API createUser response:", result);
    return result;
}

export async function updateUser(id, user) {
    console.log("API updateUser request ID:", id, "data:", user);
    const res = await fetch(`${BASE}/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(user),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API updateUser error:", errorText);
        throw new Error(errorText);
    }
    const result = await res.json();
    console.log("API updateUser response:", result);
    return result;
}

export async function deleteUser(id) {
    console.log("API deleteUser request ID:", id);
    const res = await fetch(`${BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error("API deleteUser error:", errorText);
        throw new Error(errorText);
    }
    console.log("API deleteUser success for ID:", id);
}
