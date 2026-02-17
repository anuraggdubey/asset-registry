export default function Footer() {
    return (
        <footer className="border-t border-gray-100 py-12 bg-white mt-auto">
            <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="flex flex-col items-center md:items-start">
                    <p className="font-semibold text-neutral-900 mb-2">Stellar Asset Registry</p>
                    <p className="text-sm text-neutral-500">
                        Decentralized proof of ownership for the digital age.
                    </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-neutral-500">
                    <a href="#" className="hover:text-neutral-900 transition-colors">Documentation</a>
                    <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
                </div>

                <div className="text-xs text-neutral-400">
                    © {new Date().getFullYear()} Stellar Registry. Open Source.
                </div>
            </div>
        </footer>
    );
}
