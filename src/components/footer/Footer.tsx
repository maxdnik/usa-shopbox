import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0A2647] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* GRILLA SUPERIOR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-white/10 pb-12">
          
          {/* COLUMNA 1: MARCA */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">USA SHOP BOX</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tu puerta de acceso a las mejores tiendas de USA. Comprá fácil, rápido y seguro desde la comodidad de tu casa.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="p-2 bg-white/5 rounded-full hover:bg-white/20 transition">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* COLUMNA 2: ENLACES RÁPIDOS */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Navegación</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
              <li><Link href="/buscar" className="hover:text-white transition">Buscar Productos</Link></li>
              <li><Link href="/carrito" className="hover:text-white transition">Mi Carrito</Link></li>
              <li><Link href="/track" className="hover:text-white transition">Seguimiento</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL & AYUDA */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Ayuda</h3>
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              <li><Link href="#" className="hover:text-white transition">Centro de Ayuda</Link></li>
              <li><Link href="#" className="hover:text-white transition">Términos y Condiciones</Link></li>
              <li><Link href="#" className="hover:text-white transition">Política de Privacidad</Link></li>
              <li><Link href="#" className="hover:text-white transition">Reembolsos</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Contacto</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="shrink-0 text-emerald-400" />
                <span>Miami, FL - USA<br/>Buenos Aires - ARG</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-emerald-400" />
                <span>hola@usashopbox.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-emerald-400" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT & MEDIOS DE PAGO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} USA Shop Box. Todos los derechos reservados.</p>
          <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition duration-500">
             {/* Simulación de íconos de pago */}
             <div className="h-6 w-10 bg-white/10 rounded" title="Visa"></div>
             <div className="h-6 w-10 bg-white/10 rounded" title="Mastercard"></div>
             <div className="h-6 w-10 bg-white/10 rounded" title="Amex"></div>
             <div className="h-6 w-10 bg-white/10 rounded" title="MercadoPago"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
