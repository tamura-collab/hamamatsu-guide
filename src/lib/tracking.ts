/**
 * 送客（アウトバウンドクリック）計測。ブラウザ上で動作する。
 *
 * OutboundLink が付与する data-track 属性を持つリンクのクリックを拾い、
 * OutboundEvent を組み立てて登録された各トランスポートへ送る。
 *   - consoleTransport … 開発時の確認用
 *   - memoryTransport  … window.__outboundLog に直近のイベントを保持（デバッグ・E2E テスト用）
 *   - ga4Transport     … gtag が読み込まれていれば GA4 の 'outbound_click' イベントとして送信
 *   - beaconTransport  … 自社ログ API（例: /api/log）へ navigator.sendBeacon で送信
 * 送信先を増やす場合は Transport を実装して initOutboundTracking に渡す。
 */

export type OutboundType = 'affiliate' | 'official' | 'map' | 'tel';

export interface OutboundEvent {
  event: 'outbound_click';
  type: OutboundType;
  placeId: string | null;
  category: string | null;
  section: string | null;
  /** ページ内の設置場所（card / table / detail-cta など） */
  placement: string | null;
  citySlug: string | null;
  href: string;
  /** クリックが起きたページのパス */
  page: string;
  /** ISO 8601 形式のクリック時刻 */
  timestamp: string;
}

export interface Transport {
  name: string;
  send(event: OutboundEvent): void;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __outboundLog?: OutboundEvent[];
  }
}

const TYPES: readonly OutboundType[] = ['affiliate', 'official', 'map', 'tel'];

export function buildEvent(link: HTMLAnchorElement, now = new Date()): OutboundEvent | null {
  const type = link.dataset.track as OutboundType | undefined;
  if (!type || !TYPES.includes(type)) return null;
  return {
    event: 'outbound_click',
    type,
    placeId: link.dataset.placeId ?? null,
    category: link.dataset.category ?? null,
    section: link.dataset.section ?? null,
    placement: link.dataset.placement ?? null,
    citySlug: document.documentElement.dataset.city ?? null,
    href: link.href,
    page: location.pathname,
    timestamp: now.toISOString(),
  };
}

export const consoleTransport: Transport = {
  name: 'console',
  send: (e) => console.info('[outbound]', e.type, e.placeId, e),
};

export const memoryTransport: Transport = {
  name: 'memory',
  send(e) {
    const log = (window.__outboundLog ??= []);
    log.push(e);
    if (log.length > 50) log.shift();
  },
};

export const ga4Transport: Transport = {
  name: 'ga4',
  send(e) {
    // GA4 のイベントパラメータ名は snake_case に合わせる
    window.gtag?.('event', 'outbound_click', {
      link_type: e.type,
      place_id: e.placeId,
      category: e.category,
      section: e.section,
      placement: e.placement,
      city: e.citySlug,
      link_url: e.href,
      transport_type: 'beacon',
    });
  },
};

export function beaconTransport(endpoint: string): Transport {
  return {
    name: 'beacon',
    send(e) {
      const body = JSON.stringify(e);
      // ページ遷移でリクエストが中断されないよう sendBeacon を優先し、使えなければ keepalive fetch
      const queued = navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }));
      if (!queued) {
        fetch(endpoint, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(
          () => {},
        );
      }
    },
  };
}

/** 計測を開始する。戻り値の関数で解除できる */
export function initOutboundTracking(transports: Transport[]): () => void {
  const handler = (ev: MouseEvent) => {
    // 左クリックと中クリック（新しいタブで開く）を計測する
    if (ev.type === 'auxclick' && ev.button !== 1) return;
    const link = (ev.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-track]');
    if (!link) return;
    const event = buildEvent(link);
    if (!event) return;
    for (const t of transports) {
      try {
        t.send(event);
      } catch (err) {
        console.warn(`[outbound] ${t.name} への送信に失敗しました`, err);
      }
    }
  };
  document.addEventListener('click', handler, { capture: true });
  document.addEventListener('auxclick', handler, { capture: true });
  return () => {
    document.removeEventListener('click', handler, { capture: true });
    document.removeEventListener('auxclick', handler, { capture: true });
  };
}
