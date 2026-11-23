/* sekaishi-anki service worker（スコープ: /app）
 *
 * 方針
 *  - ページ遷移（/app）: ネットワーク優先。失敗したら、保存済みのアプリの殻（index.html）を返す
 *  - JS / CSS / 画像などの静的ファイル: 保存済みを即返し、裏で更新（stale-while-revalidate）
 *  - 公開済みの問題（wh_dates の is_published=eq.true）: ネットワーク優先。失敗したら保存済みを返す
 *  - それ以外（認証・成績・提出など）: 一切キャッシュしない（常にネットワーク）
 *
 * キャッシュの形式を変えたら VERSION を上げる。古いキャッシュは activate 時に削除される。
 */
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const DATA_CACHE = `data-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, DATA_CACHE];
const SHELL_URL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add(new Request(SHELL_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !CURRENT_CACHES.includes(k)).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ページ遷移
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 同一オリジンの静的ファイル
  if (url.origin === self.location.origin && isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, ASSET_CACHE));
    return;
  }

  // 公開済みの問題マスター（Supabase の REST）。ほかのテーブルは対象外
  if (isPublishedQuestionsRequest(url)) {
    event.respondWith(networkFirstData(request));
    return;
  }
  // それ以外は respondWith しない = ブラウザの標準動作（ネットワーク）
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/icons/") ||
    /\.(?:png|svg|ico|woff2?)$/.test(pathname)
  );
}

function isPublishedQuestionsRequest(url) {
  return (
    url.pathname.startsWith("/rest/v1/wh_dates") &&
    url.searchParams.get("is_published") === "eq.true"
  );
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(SHELL_URL, response.clone());
    }
    return response;
  } catch (err) {
    const shell = await caches.match(SHELL_URL, { cacheName: SHELL_CACHE });
    if (shell) return shell;
    throw err;
  }
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);

  const update = fetch(event.request).then((response) => {
    if (response.ok && response.type === "basic") {
      cache.put(event.request, response.clone());
    }
    return response;
  });

  if (cached) {
    event.waitUntil(update.catch(() => {}));
    return cached;
  }
  return update;
}

async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Vary ヘッダーの違い（Accept-Encoding など）で取りこぼさないよう無視する
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    throw err;
  }
}
