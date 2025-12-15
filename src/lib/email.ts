import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom =
  process.env.SMTP_FROM || '"USA Shop Box" <no-reply@usashopbox.com>';
const adminNotify = process.env.ADMIN_ORDER_NOTIFY;

/**
 * Mapeo de estados -> asunto + cuerpo
 */
function statusToSubjectAndBody(
  status: string,
  orderNumber?: string
): { subject: string; text: string } | null {
  const nro = orderNumber ? ` (Orden ${orderNumber})` : "";

  switch (status) {
    case "in_miami_warehouse":
      return {
        subject: `Tu paquete llegó a Miami${nro}`,
        text:
          "Tu paquete llegó a nuestro depósito en Miami 🇺🇸.\n" +
          "Pronto coordinaremos su envío hacia Argentina.",
      };

    case "in_transit":
      return {
        subject: `Tu paquete está viajando a Argentina${nro}`,
        text:
          "Tu paquete ya salió de Miami y está en tránsito hacia Argentina ✈️.\n" +
          "Te avisaremos cuando esté disponible para entrega.",
      };

    case "delivered":
      return {
        subject: `Tu paquete fue entregado${nro}`,
        text:
          "Tu paquete fue entregado 📦.\n" +
          "Gracias por confiar en USA Shop Box. ¡Esperamos que disfrutes tu compra!",
      };

    case "cancelled":
      return {
        subject: `Tu orden fue cancelada${nro}`,
        text:
          "Tu orden fue cancelada.\n" +
          "Si no solicitaste esto o necesitás ayuda, contactanos.",
      };

    default:
      return null; // estados sin email
  }
}

/**
 * Envío de email de cambio de estado
 */
export async function sendOrderStatusEmail(order: any, status: string) {
  // Seguridad: si no hay SMTP configurado, no enviamos nada
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("⚠️ No se envía email: configuración SMTP incompleta.");
    return;
  }

  // 1. Email del cliente
  const buyer = order.buyer || {};
  const buyerEmail = buyer.email as string | undefined;

  // 2. Fallback al admin si no existe buyer.email
  const to = buyerEmail || adminNotify;

  if (!to) {
    console.warn(
      "⚠️ No se envía email: ni buyer.email ni ADMIN_ORDER_NOTIFY están configurados."
    );
    return;
  }

  // 3. Obtener contenido del email según el estado
  const mapping = statusToSubjectAndBody(status, order.orderNumber);
  if (!mapping) {
    console.log("ℹ️ Estado sin template de email, no se envía nada:", status);
    return;
  }

  const name = (buyer.fullName as string | undefined) || "Hola";

  const text =
    `${name},\n\n` +
    mapping.text +
    `\n\n` +
    "Podés consultar el estado de tu envío entrando a tu cuenta en USAShopBox.\n\n" +
    "USA Shop Box";

  // 4. Transporte SMTP
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // 465 = SSL
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  console.log(
    `📧 Enviando email de estado a ${to} (estado=${status}, order=${order._id})`
  );

  // 5. Enviar email
  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: mapping.subject,
    text,
  });

  console.log("📧 Email enviado correctamente ✔️");
}
