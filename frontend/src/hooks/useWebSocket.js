import { useEffect, useRef, useState } from 'react';
export function useWebSocket(url) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setConnected(true);
    ws.current.onclose = () => setConnected(false);
    ws.current.onmessage = (e) => {
      try { setMessages(prev => [JSON.parse(e.data), ...prev].slice(0, 500)); }
      catch {}
    };
    return () => ws.current?.close();
  }, [url]);
  return { messages, connected };
}
