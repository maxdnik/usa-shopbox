import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models/Order";
import { preference } from "@/lib/mercadopago";

/**
 * 💳 GENERADOR DE PAGOS - MERCADO PAGO
 * Este endpoint crea una "Preferencia" de pago. Devuelve el link (init_point)
 * para que el usuario pueda pagar en pesos argentinos.
 */

export async function POST(req: NextRequest) {
  console.log("💳 [MP API] Iniciando creación de preferencia de pago...");

  try {
    await dbConnect();

    // Capturamos el ID de la orden desde el cuerpo de la petición
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      console.error("❌ [MP API] Error: orderId no proporcionado en el body.");
      return NextResponse.json(
        { ok: false, message: "El ID de la orden es obligatorio." },
        { status: 400 }
      );
    }

    // 1. Buscamos la orden real en la base de datos
    // Lo hacemos por ID para asegurar que el total sea el que guardamos nosotros.
    const order = await Order.findById(orderId).lean();

    if (!order) {
      console.error(`❌ [MP API] No se encontró la orden con ID: ${orderId}`);
      return NextResponse.json(
        { ok: false, message: "La orden especificada no existe." },
        { status: 404 }
      );
    }

    // 2. Cálculo del total en Pesos (ARS)
    // Mercado Pago requiere ARS. Usamos la cotización de $1450 (Dólar Tarjeta aprox).
    // Nota: Podés cambiar el 1450 por una variable de entorno si querés.
    const exchangeRate = 1450;
    const totalARS = Math.round((order.totalUSD || 0) * exchangeRate);

    console.log(`📦 [MP API] Generando pago para Orden ${order.orderNumber}. Total: AR$ ${totalARS.toLocaleString()}`);

    // 3. Creamos la "Preferencia" en los servidores de Mercado Pago
    const response = await preference.create({
      body: {
        items: [
          {
            id: order.orderNumber || order._id.toString(),
            title: `Pedido USAShopBox ${order.orderNumber || ""}`,
            quantity: 1,
            unit_price: totalARS,
            currency_id: 'ARS',
          }
        ],
        // Definimos a dónde vuelve el usuario tras interactuar con Mercado Pago
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?orderId=${orderId}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/carrito`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/orders`,
        },
        auto_return: 'approved',
        // 🛠️ Webhook: La URL que Mercado Pago llamará para avisarnos que el pago entró.
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
        // Importante: Guardamos el ID de MongoDB aquí para identificar la orden al recibir la notificación
        external_reference: orderId, 
      }
    });

    console.log("✅ [MP API] Preferencia creada con éxito. Link generado.");

    // Devolvemos el init_point (el link oficial a donde redirigir al usuario)
    return NextResponse.json({ 
      ok: true, 
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error("❌ [MP API] Error crítico al crear preferencia de Mercado Pago:", error);
    return NextResponse.json(
      { 
        ok: false, 
        message: "Ocurrió un error al intentar generar el link de pago.",
        error: error?.message 
      },
      { status: 500 }
    );
  }
}