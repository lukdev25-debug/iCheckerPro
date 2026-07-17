/**
 * Renders the sickw.com API response in a readable format.
 * The API can return:
 * - result as an object (format=beta): { IMEI: ..., Manufacturer: ..., ... }
 * - result as a string with HTML tags (format=json): "IMEI: xxx<br>Manufacturer: APPLE<br>..."
 * - top-level fields: imei, status, balance, price, id, service
 */
export default function SickwResult({ result }: { result: any }) {
  if (!result) return null;

  const status = result.status ?? 'unknown';
  const isError = status === 'error';

  // Extract the result payload
  const resultPayload = result.result;
  const isObjectResult = typeof resultPayload === 'object' && resultPayload !== null;
  const isStringResult = typeof resultPayload === 'string';

  // Parse string result into key-value pairs
  const parseStringResult = (str: string) => {
    // Remove HTML tags but keep the text
    const clean = str.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    return clean
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  // Parse object result into key-value pairs
  const parseObjectResult = (obj: Record<string, any>) => {
    return Object.entries(obj).map(([key, value]) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(value),
    }));
  };

  // Check if a value indicates ON/Locked/Blacklisted
  const getStatusColor = (label: string, value: string) => {
    const v = value.toLowerCase();
    if (label.toLowerCase().includes('fmi') || label.toLowerCase().includes('find my')) {
      if (v.includes('on')) return 'text-danger';
      if (v.includes('off')) return 'text-neon-500';
    }
    if (label.toLowerCase().includes('icloud')) {
      if (v.includes('on') || v.includes('lost')) return 'text-danger';
      if (v.includes('off') || v.includes('clean')) return 'text-neon-500';
    }
    if (label.toLowerCase().includes('blacklist')) {
      if (v.includes('blacklist') || v.includes('blocked')) return 'text-danger';
      if (v.includes('clean')) return 'text-neon-500';
    }
    if (label.toLowerCase().includes('sim') || label.toLowerCase().includes('lock')) {
      if (v.includes('locked')) return 'text-danger';
      if (v.includes('unlocked')) return 'text-neon-500';
    }
    if (label.toLowerCase().includes('mdm')) {
      if (v.includes('on')) return 'text-danger';
      if (v.includes('off')) return 'text-neon-500';
    }
    return 'text-white';
  };

  if (isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
        <p className="text-sm font-medium text-danger">Error</p>
        <p className="mt-1 text-sm text-muted">{String(resultPayload ?? 'Unknown error')}</p>
      </div>
    );
  }

  let rows: { label: string; value: string }[] = [];

  if (isObjectResult) {
    rows = parseObjectResult(resultPayload as Record<string, any>);
  } else if (isStringResult) {
    const lines = parseStringResult(resultPayload as string);
    rows = lines.map((line) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 40) {
        return {
          label: line.slice(0, colonIdx).trim(),
          value: line.slice(colonIdx + 1).trim(),
        };
      }
      return { label: '', value: line };
    });
  }

  // Also show top-level metadata
  const meta: { label: string; value: string }[] = [];
  if (result.id) meta.push({ label: 'Order ID', value: String(result.id) });
  if (result.service) meta.push({ label: 'Service ID', value: String(result.service) });
  if (result.price) meta.push({ label: 'Price Charged', value: `$${result.price}` });
  if (result.balance !== undefined) meta.push({ label: 'API Balance', value: `$${result.balance}` });

  return (
    <div className="space-y-4">
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {meta.map((m) => (
            <div key={m.label} className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5">
              <span className="text-xs text-muted">{m.label}: </span>
              <span className="text-xs font-medium text-white">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col gap-0.5 rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5">
              {row.label && (
                <span className="text-xs text-muted">{row.label}</span>
              )}
              <span
                className={`text-sm font-medium ${getStatusColor(row.label, row.value)}`}
                dangerouslySetInnerHTML={{ __html: row.value }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-4">
          <pre className="whitespace-pre-wrap break-words text-sm text-muted">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
