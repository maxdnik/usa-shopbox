import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtenemos el Dólar Tarjeta (Oficial + Impuestos)
    const res = await fetch("https://dolarapi.com/v1/dolares/tarjeta", {
      next: { revalidate: 3600 } // Cacheamos por 1 hora
    });
    const data = await res.json();
    
    return NextResponse.json({ 
      rate: data.venta, 
      lastUpdate: data.fechaActualizacion 
    });
  } catch (error) {
    return NextResponse.json({ rate: 1450 }, { status: 500 }); // Fallback manual
  }
}