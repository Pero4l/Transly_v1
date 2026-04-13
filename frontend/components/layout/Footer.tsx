"use client";

import Link from "next/link";
import { Package, Globe, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 text-white font-bold text-2xl">
              <Package className="h-8 w-8 text-orange-600" />
              <span>Transly</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Revolutionizing logistics with transparency, speed, and real-time intelligence. 
              Delivering excellence across borders and making every shipment count.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-orange-600 hover:text-white transition-all">
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/tracking" className="hover:text-orange-500 transition-colors">Track Shipment</Link></li>
              <li><Link href="/request" className="hover:text-orange-500 transition-colors">Create Request</Link></li>
              <li><Link href="/dashboard" className="hover:text-orange-500 transition-colors">Client Dashboard</Link></li>
              <li><Link href="/driver" className="hover:text-orange-500 transition-colors">Driver Portal</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Shipping Guide</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">Reach Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                <span>123 Logistics Way, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-orange-500 shrink-0" />
                <span>+234 (0) 800-TRANSLY</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-orange-500 shrink-0" />
                <span>hello@transly-logistics.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} Transly Logistics. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Global Network Online</span>
            <span>Security Certified (ISO 9001)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
