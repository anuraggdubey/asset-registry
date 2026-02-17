export default function Loader({ text = "Processing..." }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );
}
