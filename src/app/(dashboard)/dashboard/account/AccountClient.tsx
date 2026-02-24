"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Arca = {
  enabled: boolean;
  totalUSD: number;
  usedUSD: number;
};

type Billing = {
  fullName: string;
  dni: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
};

type PaymentMethod = {
  type: "card" | "mp" | "transfer";
  last4?: string;
  brand?: string;
  label?: string;
  isDefault?: boolean;
};

type Address = {
  street?: string;
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
};

type UserPayload = {
  name: string;
  email: string;
  image?: string;
  phone?: string;
  dni?: string;
  arca: Arca;
  billing: Billing;
  paymentMethods: PaymentMethod[];
};

const emptyAddress: Address = {
  streetName: "",
  streetNumber: "",
  floor: "",
  apartment: "",
  city: "",
  province: "",
  postalCode: "",
};

const emptyArca: Arca = { enabled: false, totalUSD: 0, usedUSD: 0 };

const emptyBilling: Billing = {
  fullName: "",
  dni: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
};

export default function AccountClient() {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<UserPayload>({
    name: "",
    email: "",
    image: "",
    phone: "",
    dni: "",
    arca: emptyArca,
    billing: emptyBilling,
    paymentMethods: [],
  });

  const [address, setAddress] = useState<Address>(emptyAddress);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Para bloquear / habilitar los campos de facturación
  const [billingEditable, setBillingEditable] = useState(false);

  const sessionName = useMemo(() => session?.user?.name ?? "", [session]);
  const sessionEmail = useMemo(() => session?.user?.email ?? "", [session]);
  const sessionImage = useMemo(() => session?.user?.image ?? "", [session]);

  // ================== CARGA INICIAL DESDE /api/account ==================
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setErr(null);
      setMsg(null);

      try {
        const res = await fetch("/api/account", { cache: "no-store" }).catch(
          () => null
        );

        let data: any = null;
        if (res && res.ok) {
          data = await res.json();
        } else {
          data = {};
        }

        const u = data || {};
        const addr = u.address || {};
        const billingFromDb: Billing | any = u.billing || {};

        // Dirección de facturación autocompletada con dirección de entrega
        const composedBillingAddress =
          billingFromDb.address ||
          [
            addr.streetName,
            addr.streetNumber,
            addr.floor ? `Piso ${addr.floor}` : "",
            addr.apartment ? `Depto ${addr.apartment}` : "",
          ]
            .filter(Boolean)
            .join(" ");

        setUser({
          name: u.name || sessionName || "",
          email: u.email || sessionEmail || "",
          image: u.image || sessionImage || "",
          phone: u.phone || "",
          dni: u.dni || "",
          arca: {
            enabled: !!u.arca?.enabled,
            totalUSD: Number(u.arca?.totalUSD || 0),
            usedUSD: Number(u.arca?.usedUSD || 0),
          },
          billing: {
            fullName: billingFromDb.fullName || u.name || sessionName || "",
            dni: billingFromDb.dni || u.dni || "",
            address: composedBillingAddress || "",
            city: billingFromDb.city || addr.city || "",
            province: billingFromDb.province || addr.province || "",
            postalCode: billingFromDb.postalCode || addr.postalCode || "",
          },
          paymentMethods: Array.isArray(u.paymentMethods)
            ? u.paymentMethods
            : [],
        });

        setAddress({
          street: addr.street || "",
          streetName: addr.streetName || "",
          streetNumber: addr.streetNumber || "",
          floor: addr.floor || "",
          apartment: addr.apartment || "",
          city: addr.city || "",
          province: addr.province || "",
          postalCode: addr.postalCode || "",
        });
      } catch (e: any) {
        console.error("Error cargando /api/account:", e);
        setErr("No pudimos cargar tus datos. Reintentá en unos segundos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, sessionName, sessionEmail, sessionImage]);

  // ================== GUARDAR EN /api/account (PUT) ==================
  async function handleSave() {
    setSaving(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          dni: user.dni,
          address,
          arca: user.arca,
          billing: user.billing,
          // paymentMethods: user.paymentMethods, // cuando lo quieras usar lo agregamos también al backend
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Error guardando perfil.");
      }

      setMsg("Cambios guardados ✅");
      setBillingEditable(false);
    } catch (e: any) {
      console.error("Error guardando /api/account:", e);
      setErr(e.message || "Error guardando cambios.");
    } finally {
      setSaving(false);
    }
  }

  const remainingUSD = Math.max(
    0,
    Number(user.arca.totalUSD || 0) - Number(user.arca.usedUSD || 0)
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-white/80">
        Cargando perfil...
      </div>
    );
  }

  // ================== UI ==================
  return (
    <div className="space-y-5">
      {/* Header contenido */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-[#ff3347] px-6 py-3 text-sm font-semibold text-white hover:bg-[#ff4d63] transition shadow disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {msg && (
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 px-4 py-3 text-sm">
          {msg}
        </div>
      )}
      {err && (
        <div className="rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      {/* Layout 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-5">
          {/* Datos personales */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Datos personales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium">Nombre y apellido</span>
                <input
                  value={user.name}
                  onChange={(e) =>
                    setUser((u) => ({ ...u, name: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Email</span>
                <input
                  value={user.email}
                  readOnly
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600 cursor-not-allowed"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Teléfono</span>
                <input
                  value={user.phone || ""}
                  onChange={(e) =>
                    setUser((u) => ({ ...u, phone: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">DNI / CUIT</span>
                <input
                  value={user.dni || ""}
                  onChange={(e) =>
                    setUser((u) => ({ ...u, dni: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>
            </div>
          </div>

          {/* Dirección de entrega */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Dirección de entrega</h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 col-span-2">
                <span className="text-sm font-medium">Calle</span>
                <input
                  value={address.streetName}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, streetName: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Número</span>
                <input
                  value={address.streetNumber}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, streetNumber: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Piso</span>
                <input
                  value={address.floor || ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, floor: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Depto</span>
                <input
                  value={address.apartment || ""}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, apartment: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">CP</span>
                <input
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, postalCode: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1 col-span-2">
                <span className="text-sm font-medium">Ciudad</span>
                <input
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>

              <label className="space-y-1 col-span-2">
                <span className="text-sm font-medium">Provincia</span>
                <input
                  value={address.province}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, province: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d]"
                />
              </label>
            </div>
          </div>

          {/* Datos de facturación */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Datos de facturación</h2>
              <button
                type="button"
                onClick={() => setBillingEditable((prev) => !prev)}
                className="text-xs font-semibold rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100"
              >
                {billingEditable ? " Guardar" : "Editar datos"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium">
                  Nombre / Razón social
                </span>
                <input
                  value={user.billing.fullName}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, fullName: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">DNI / CUIT</span>
                <input
                  value={user.billing.dni}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, dni: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Dirección</span>
                <input
                  value={user.billing.address}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, address: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Ciudad</span>
                <input
                  value={user.billing.city}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, city: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">Provincia</span>
                <input
                  value={user.billing.province}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, province: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium">CP</span>
                <input
                  value={user.billing.postalCode}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      billing: { ...u.billing, postalCode: e.target.value },
                    }))
                  }
                  disabled={!billingEditable}
                  className={
                    "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0a2a4d] " +
                    (!billingEditable ? "bg-slate-100 cursor-not-allowed" : "")
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="space-y-5">
          {/* Cupo ARCA */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Cupo ARCA</h3>

              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={user.arca.enabled}
                  onChange={(e) =>
                    setUser((u) => ({
                      ...u,
                      arca: { ...u.arca, enabled: e.target.checked },
                    }))
                  }
                />
                Activado
              </label>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Cupo total</span>
                <span className="font-semibold">
                  USD {Number(user.arca.totalUSD || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Cupo usado</span>
                <span className="font-semibold">
                  USD {Number(user.arca.usedUSD || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-slate-600">Disponible</span>
                <span className="font-semibold text-emerald-700">
                  USD {remainingUSD.toFixed(2)}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Este cupo se calcula automáticamente según tus compras.
              </p>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="rounded-2xl bg-white text-slate-900 p-6 shadow-sm">
            <h3 className="text-base font-semibold mb-3">Métodos de pago</h3>

            {user.paymentMethods.length === 0 ? (
              <div className="text-sm text-slate-600 space-y-1">
                <p>No tenés métodos guardados todavía.</p>
                <p className="text-xs text-slate-500">
                  Próximamente vas a poder agregar/quitar métodos desde acá.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.paymentMethods.map((pm, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="font-semibold">
                          {pm.label || pm.type.toUpperCase()}
                        </p>
                        <p className="text-slate-600">
                          {pm.brand ? `${pm.brand} ` : ""}
                          {pm.last4 ? `•••• ${pm.last4}` : ""}
                        </p>
                      </div>

                      <label className="text-xs flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!pm.isDefault}
                          onChange={(e) =>
                            setUser((u) => ({
                              ...u,
                              paymentMethods: u.paymentMethods.map((x, i) =>
                                i === idx
                                  ? { ...x, isDefault: e.target.checked }
                                  : { ...x, isDefault: false }
                              ),
                            }))
                          }
                        />
                        Default
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
