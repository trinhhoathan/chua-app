'use client';

import { useCallback, useEffect, useRef, type UIEvent, type WheelEvent } from 'react';

const NEAR_BOTTOM_PX = 120;

/**
 * Auto-scroll khi AI stream — chỉ bám đáy nếu người dùng đang ở gần cuối.
 * Kéo lên đọc đoạn đầu sẽ không bị kéo ngược xuống.
 * Scroll programmatic không làm tắt chế độ bám đáy (tránh mất con trỏ stream).
 */
export function useStickToBottom(deps: readonly unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const ignoreScrollRef = useRef(false);

  const scrollToEnd = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
      return;
    }
    ignoreScrollRef.current = true;
    el.scrollTop = el.scrollHeight;
    // Layout có thể chưa kịp (con trỏ stream vừa thêm) — chỉnh lại sau frame
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
      requestAnimationFrame(() => {
        ignoreScrollRef.current = false;
      });
    });
  }, []);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    if (ignoreScrollRef.current) return;
    const el = e.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distance <= NEAR_BOTTOM_PX;
  }, []);

  /** User chủ động kéo lên → bỏ bám đáy ngay. */
  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) stickRef.current = false;
  }, []);

  /** Gọi khi gửi tin mới — buộc bám đáy lại. */
  const stickToBottom = useCallback(() => {
    stickRef.current = true;
    scrollToEnd();
  }, [scrollToEnd]);

  useEffect(() => {
    if (!stickRef.current) return;
    scrollToEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps truyền từ caller
  }, deps);

  return { containerRef, bottomRef, onScroll, onWheel, stickToBottom };
}
