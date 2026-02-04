import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || '"USA Shop Box" <no-reply@usashopbox.com>';
const adminNotify = process.env.ADMIN_ORDER_NOTIFY;

/**
 * Mapeo de estados -> Título Visual + Cuerpo de mensaje
 */
function statusToTemplateData(status: string, orderNumber?: string) {
  const nro = orderNumber ? ` #${orderNumber}` : "";

  switch (status) {
    // 👇👇 AGREGADO: Caso faltante para "Procesando / En camino a Miami" 👇👇
    case "processing":
      return {
        subject: `Tu compra está viajando a Miami${nro}`,
        title: "¡COMPRA REALIZADA!",
        description: "¡Buenas noticias!  🇺🇸 Tu producto ahora mismo está viajando hacia nuestro depósito en Miami. Te avisaremos apenas lo recibamos.",
        color: "#F59E0B" // Color Ámbar para indicar proceso activo
      };
    // 👆👆 FIN DEL AGREGADO 👆👆

    case "in_miami_warehouse":
      return {
        subject: `Tu paquete llegó a Miami${nro}`,
        title: "¡Ya lo tenemos en USA!",
        description: "Tu paquete llegó a nuestro depósito en Miami 🇺🇸. Pronto coordinaremos su envío hacia Argentina.",
        color: "#1E3A8A"
      };
    case "in_transit":
      return {
        subject: `Tu paquete está viajando a Argentina${nro}`,
        title: "¡En camino a Argentina!",
        description: "Tu paquete ya salió de Miami y está en tránsito ✈️. Te avisaremos apenas esté disponible para la entrega local.",
        color: "#D72638"
      };
    case "shipped":
      return {
        subject: `Tu pedido está en camino a tu domicilio${nro}`,
        title: "¡LLEGÓ A ARGENTINA!",
        description: "Tu pedido ya está siendo procesado por nuestro correo local para la entrega final 🚛. ¡Falta muy poco!",
        color: "#059669"
      };
    case "delivered":
      return {
        subject: `Tu paquete fue entregado${nro}`,
        title: "¡Entrega completada!",
        description: "Tu paquete fue entregado con éxito 📦. ¡Esperamos que disfrutes mucho tu compra!",
        color: "#0A2647"
      };
    case "cancelled":
      return {
        subject: `Tu orden fue cancelada${nro}`,
        title: "Orden Cancelada",
        description: "Tu orden ha sido cancelada. Si tenés dudas o no solicitaste esto, contactanos de inmediato.",
        color: "#ef4444"
      };
    default:
      return null;
  }
}

/**
 * Generador de Plantilla HTML Profesional - Versión Centrada Potenciada
 */
function getHtmlTemplate(
  name: string, 
  title: string, 
  description: string, 
  color: string, 
  orderId: string, 
  additionalContentHtml: string = "",
  trackingInfo?: { number: string, courier: string } // 🛠️ Parámetro para información de seguimiento
) {
  // 🛠️ BLOQUE DE TRACKING MEJORADO
  // Si tenemos un número de seguimiento, mostramos el cuadro destacado.
  const trackingBlock = (trackingInfo?.number && trackingInfo.number !== "Pendiente") ? `
    <div style="background-color: #f1f5f9; border-radius: 20px; padding: 25px; margin: 25px auto; border: 1px dashed #cbd5e1; text-align: center; max-width: 400px;">
      <p style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.1em;">Seguimiento Correo Local</p>
      <p style="font-size: 24px; font-weight: 900; color: #0A2647; margin: 0; letter-spacing: -0.02em;">${trackingInfo.number}</p>
      <p style="font-size: 11px; font-weight: bold; color: #94a3b8; margin-top: 8px; text-transform: uppercase;">Empresa: ${trackingInfo.courier}</p>
    </div>
  ` : "";

  return `
    <div style="background-color: #f5f5f5; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eeeeee;">
        
        <div style="background-color: #0A2647; padding: 30px; text-align: center;">
           <div style="display: inline-block; background-color: white; color: #0A2647; font-weight: bold; padding: 5px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px;">USA</div>
           <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: -0.05em;">USASHOPBOX</h1>
        </div>

        <div style="padding: 40px; text-align: center;">
          <h2 style="color: ${color}; font-size: 28px; font-weight: 900; margin-top: 0; margin-bottom: 20px; text-transform: uppercase; letter-spacing: -0.05em;">${title}</h2>
          <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Hola, ${name}</p>
          <p style="font-size: 16px; line-height: 1.6; color: #64748b; margin-bottom: 30px; max-width: 450px; margin-left: auto; margin-right: auto;">${description}</p>
          
          ${trackingBlock} 
          
          ${additionalContentHtml}

          <div style="text-align: center; margin-bottom: 30px; margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders" 
               style="background-color: #D72638; color: #ffffff; padding: 18px 35px; border-radius: 20px; text-decoration: none; font-weight: 900; font-size: 12px; letter-spacing: 0.1em; display: inline-block; text-transform: uppercase;">
               Seguir mi pedido
            </a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
            <p style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">ID de Seguimiento: ${orderId}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Si tenés dudas, respondé a este correo.</p>
          <p style="font-size: 10px; font-weight: bold; color: #cbd5e1; margin-top: 10px; text-transform: uppercase;">© ${new Date().getFullYear()} USAShopBox Logistics</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Envío de email de cambio de estado (Sincronizado con Tracking)
 */
export async function sendOrderStatusEmail(order: any, status: string) {
  if (!smtpHost || !smtpUser || !smtpPass) return;

  const buyer = order.buyer || {};
  const to = buyer.email || adminNotify;
  if (!to) return;

  const templateData = statusToTemplateData(status, order.orderNumber);
  if (!templateData) return;

  const name = buyer.fullName?.split(" ")[0] || "Hola";
  
  // 🛠️ CAPTURA DE DATOS DESDE LA ORDEN ACTUALIZADA
  // Es vital que localTrackingNumber y localCourierName existan en el objeto 'order'
  const trackingInfo = status === 'shipped' ? {
    number: order.localTrackingNumber || "Pendiente",
    courier: order.localCourierName || "Correo Local"
  } : undefined;

  const htmlContent = getHtmlTemplate(
    name, 
    templateData.title, 
    templateData.description, 
    templateData.color, 
    order.orderNumber || order._id,
    "", 
    trackingInfo 
  );

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: templateData.subject,
    html: htmlContent,
    text: `${name}: ${templateData.description}`,
  });
}

/**
 * 📧 Envío de Confirmación de Orden Inicial (MANTENIDO)
 */
export async function sendOrderCreatedEmail(order: any) {
  if (!smtpHost || !smtpUser || !smtpPass) return;

  const buyer = order.buyer || {};
  const to = buyer.email || adminNotify;
  if (!to) return;

  const name = (buyer.fullName?.split(" ")[0] || "Cliente");
  const orderNumber = order.orderNumber;
  const totalUSD = order.totalUSD;

  const itemsHtml = `
    <div style="background-color: #f8fafc; border-radius: 24px; padding: 25px; margin-bottom: 30px; border: 1px solid #f1f5f9; text-align: left;">
      <p style="font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">Resumen de tu compra</p>
      ${order.items.map((i: any) => `
        <div style="border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1;">
            <p style="margin: 0; font-size: 13px; font-weight: 800; color: #0A2647; text-transform: uppercase;">${i.title}</p>
            <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: bold;">SKU: ${i.sku || "N/A"}</p>
          </div>
          <div style="text-align: right; margin-left: 20px;">
            <p style="margin: 0; font-size: 14px; font-weight: 900; color: #1E3A8A;">x${i.qty || i.quantity}</p>
          </div>
        </div>
      `).join("")}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #0A2647; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; font-weight: 900; color: #0A2647; text-transform: uppercase;">Total Final</span>
          <span style="font-size: 22px; font-weight: 900; color: #1E3A8A;">USD ${totalUSD.toLocaleString()}</span>
      </div>
    </div>
  `;

  const htmlContent = getHtmlTemplate(
    name,
    "¡Pedido Recibido!",
    `Tu orden <b>${orderNumber}</b> ha sido creada con éxito. Ya estamos listos para empezar a procesarla y traerte tus productos de USA.`,
    "#0A2647",
    orderNumber,
    itemsHtml
  );

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject: `Confirmación de tu pedido ${orderNumber} - USAShopBox`,
    html: htmlContent,
    text: `Hola ${name}, tu orden ${orderNumber} fue creada correctamente.`,
  });
}