"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useWalletStore } from "@/lib/state/walletStore";
import ConnectButton from "../wallet/ConnectButton";
import CopyButton from "./CopyButton";

export default function Navbar() {
    const pathname = usePathname();
    const { publicKey } = useWalletStore();

    const isActive = (path: string) => pathname === path ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900";

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    return (
        <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-200">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-16">

                <div className="flex items-center gap-8">
                    <Link href="/" className="font-semibold text-lg tracking-tight text-neutral-900 z-50">
                        Stellar Registry
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-6 text-sm">
                        <Link href="/dashboard" className={`transition-colors ${isActive("/dashboard")}`}>
                            Dashboard
                        </Link>
                        <Link href="/register" className={`transition-colors ${isActive("/register")}`}>
                            Register
                        </Link>
                        <Link href="/transfer" className={`transition-colors ${isActive("/transfer")}`}>
                            Transfer
                        </Link>
                        <Link href="/verify" className={`transition-colors ${isActive("/verify")}`}>
                            Verify
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Desktop Wallet & Mobile Hamburger Right Side */}
                    <div className="hidden md:flex">
                        {publicKey ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="font-mono text-xs text-gray-600">
                                    {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                                </span>
                                <CopyButton text={publicKey} className="text-[10px] py-0.5 px-1.5 h-auto text-gray-500 bg-white border border-gray-200" />
                            </div>
                        ) : (
                            <ConnectButton />
                        )}
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 z-50"
                        onClick={toggleMenu}
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 flex flex-col pt-24 px-6 md:hidden animate-in slide-in-from-top-10 duration-200">
                    <div className="flex flex-col gap-6 text-lg font-medium">
                        <Link href="/dashboard" onClick={toggleMenu} className={`${isActive("/dashboard")}`}>
                            Dashboard
                        </Link>
                        <Link href="/register" onClick={toggleMenu} className={`${isActive("/register")}`}>
                            Register
                        </Link>
                        <Link href="/transfer" onClick={toggleMenu} className={`${isActive("/transfer")}`}>
                            Transfer
                        </Link>
                        <Link href="/verify" onClick={toggleMenu} className={`${isActive("/verify")}`}>
                            Verify
                        </Link>

                        <div className="border-t border-gray-100 pt-6 mt-2">
                            {publicKey ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md border border-gray-200 w-fit">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="font-mono text-xs text-gray-600">
                                            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
                                        </span>
                                        <CopyButton text={publicKey} />
                                    </div>
                                    <div className="text-xs text-gray-500">Wallet Connected</div>
                                </div>
                            ) : (
                                <ConnectButton />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
