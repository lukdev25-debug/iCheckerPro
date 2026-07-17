*** Begin Patch
*** Update File: src/pages/DashboardPage.tsx
@@
-  const handleCheck = async (e: FormEvent) => {
+  const handleCheck = async (e: FormEvent) => {
@@
-    try {
-      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/imei-check`;
-      const res = await fetch(apiUrl, {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
-        },
-        body: JSON.stringify({ imei, service, user_id: user!.id }),
-      });
-      const data = await res.json();
-
-      if (!res.ok) {
-        setError(data.error ?? 'Check failed');
-      } else {
-        setCheckResult(data.result);
-        setImei('');
-        refresh();
-      }
-    } catch {
-      setError('Network error. Please try again.');
-    } finally {
-      setChecking(false);
-    }
+    try {
+      // Use Netlify Function for IMEI check
+      const apiUrl = '/.netlify/functions/imei-check';
+      const res = await fetch(apiUrl, {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ imei, service, user_id: user!.id }),
+      });
+      const data = await res.json();
+
+      if (!res.ok) {
+        setError(data.error ?? 'Check failed');
+      } else {
+        setCheckResult(data.result);
+        setImei('');
+        refresh();
+      }
+    } catch (err) {
+      console.error('handleCheck error', err);
+      setError('Network error. Please try again.');
+    } finally {
+      setChecking(false);
+    }
   };
@@
-  const handleTopup = async () => {
+  const [topupMethod, setTopupMethod] = useState<'mercadopago' | 'binance'>('mercadopago');
+
+  const handleTopup = async () => {
     setTopupError(null);
     setTopupLoading(true);
 
     try {
-      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago?action=create`;
-      const res = await fetch(apiUrl, {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
-        },
-        body: JSON.stringify({
-          amount: topupAmount,
-          user_id: user!.id,
-          email: user!.email,
-          origin: window.location.origin,
-        }),
-      });
-      const data = await res.json();
-
-      if (!res.ok) {
-        setTopupError(data.error ?? 'Failed to create payment');
-      } else if (data.init_point || data.sandbox_init_point) {
-        window.location.href = data.sandbox_init_point ?? data.init_point;
-      } else {
-        setTopupError('No payment URL returned');
-      }
+      if (topupMethod === 'mercadopago') {
+        const apiUrl = '/.netlify/functions/mercadopago?action=create';
+        const res = await fetch(apiUrl, {
+          method: 'POST',
+          headers: { 'Content-Type': 'application/json' },
+          body: JSON.stringify({ amount: topupAmount, user_id: user!.id, email: user!.email, origin: window.location.origin }),
+        });
+        const data = await res.json();
+
+        if (!res.ok) {
+          setTopupError(data.error ?? 'Failed to create payment');
+        } else if (data.init_point || data.sandbox_init_point) {
+          window.location.href = data.sandbox_init_point ?? data.init_point;
+        } else {
+          setTopupError('No payment URL returned');
+        }
+      } else if (topupMethod === 'binance') {
+        // For Binance top-up we use a create-order function which returns paymentCode/qr/binanceId
+        const apiUrl = '/.netlify/functions/binance-create-order';
+        const res = await fetch(apiUrl, {
+          method: 'POST',
+          headers: { 'Content-Type': 'application/json' },
+          body: JSON.stringify({ amount: topupAmount, user_id: user!.id }),
+        });
+        const data = await res.json();
+        if (!res.ok || !data.success) {
+          setTopupError(data.error ?? 'Failed to create Binance order');
+        } else {
+          // show modal or redirect to payment instructions (we'll show a simple alert for now)
+          alert('Orden creada. Revisa las instrucciones de pago en la wallet.');
+          // refresh wallet to show pending transaction
+          refresh();
+        }
+      }
     } catch {
       setTopupError('Network error. Please try again.');
     } finally {
       setTopupLoading(false);
     }
   };
*** End Patch
