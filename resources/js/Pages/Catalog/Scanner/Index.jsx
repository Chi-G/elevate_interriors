import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Camera, Scan, Package, AlertCircle, CheckCircle2, ShoppingCart, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function Index() {
    const { auth } = usePage().props;
    const [scannedResult, setScannedResult] = useState(null);
    const [product, setProduct] = useState(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    // Form data for quick adjustment
    const [formData, setFormData] = useState({
        quantity: 1,
        type: 'IN',
        notes: '',
    });
    const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'machine'
    const machineInputRef = useRef(null);

    useEffect(() => {
        let scanner = null;
        if (scanMode === 'camera') {
            scanner = new Html5QrcodeScanner('reader', {
                fps: 20, // Increased FPS for faster detection
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    // Wider box for 1D barcodes, square-ish for QR
                    const width = viewfinderWidth * 0.8;
                    const height = Math.min(viewfinderHeight * 0.4, 250);
                    return { width, height };
                },
                rememberLastUsedCamera: true,
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                showZoomSliderIfSupported: true,
                // Add explicit formats to prioritize
                formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
            });

            scanner.render(onScanSuccess, (err) => {
                // Ignore standard "not found" errors which happen 30 times a second
                if (err?.includes("NotFound")) return;
                console.error("Scanner error:", err);
            });
        }

        if (scanMode === 'machine') {
            const focusInput = () => machineInputRef.current?.focus();
            focusInput();
            window.addEventListener('click', focusInput);
            return () => window.removeEventListener('click', focusInput);
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(error => console.error("Failed to clear scanner. ", error));
            }
        };
    }, [scanMode]);

    // Handle machine (keyboard) scan
    const handleMachineScan = (e) => {
        if (e.key === 'Enter') {
            triggerLookup(e.target.value);
            e.target.value = '';
        }
    };

    const triggerLookup = (barcode) => {
        if (!barcode) return;
        const cleaned = typeof barcode === 'string' ? barcode.trim() : String(barcode).trim();
        if (cleaned) {
            setScannedResult(cleaned);
            playBeep();
            lookupProduct(cleaned);
        }
    };

    const playBeep = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/766/766-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.warn("Audio play blocked by browser action. Interact with the page first."));
        } catch (e) {
            console.error("Audio beep error:", e);
        }
    };

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText !== scannedResult) {
            triggerLookup(decodedText);
        }
    }

    function onScanFailure(error) {
        // quiet fail
        // now how will it fail? is there no code to be written here?

    }

    const lookupProduct = async (barcode) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(route('api.products.lookup', {
                slug: auth.user.slug,
                barcode: barcode
            }));
            setProduct(response.data);
            setIsAdjustModalOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Product not found');
            setScannedResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustment = (e) => {
        e.preventDefault();
        router.post(route('products.stock', {
            slug: auth.user.slug,
            product: product.id
        }), formData, {
            onSuccess: () => {
                setIsAdjustModalOpen(false);
                setScannedResult(null);
                setProduct(null);
                setFormData({ quantity: 1, type: 'IN', notes: '' });
                // Success toast handled by layout
            },
        });
    };

    return (
        <AuthenticatedLayout header="Scan Center">
            <Head title="Scan Center" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-medium text-[#1E1B18] tracking-tight">Scan Center</h1>
                    <p className="text-slate-500 text-sm mt-1">Live barcode scanning and rapid inventory lookups.</p>
                </div>

                <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-xl overflow-hidden mb-8">
                    <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row md:justify-between md:items-center gap-6 transition-colors">
                        <div>
                            <h2 className="text-2xl font-serif font-medium flex items-center gap-3 text-[#C9A24B]">
                                <Scan className="w-6 h-6" />
                                Interactive Scan Center
                            </h2>
                            <p className="text-slate-400 mt-1 text-sm">Select your scanning preference below.</p>
                        </div>
                        <div className="flex bg-slate-800 p-1.5 rounded-xl border border-slate-700 w-full md:w-auto">
                            <button
                                onClick={() => setScanMode('camera')}
                                className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${scanMode === 'camera' ? 'bg-[#B8874A] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Camera className="w-3.5 h-3.5" />
                                Camera
                            </button>
                            <button
                                onClick={() => setScanMode('machine')}
                                className={`flex-1 md:flex-none px-4 py-3 md:py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${scanMode === 'machine' ? 'bg-[#B8874A] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Scan className="w-3.5 h-3.5" />
                                QR Machine
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {scanMode === 'camera' ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-[#D9C4A1] bg-slate-50 min-h-[300px]"></div>
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-3 text-amber-700 text-xs font-medium">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>If camera doesn't show, ensure you are on <strong>HTTPS</strong> and have granted permissions.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 md:py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#D9C4A1] bg-[#FBF7EE]/40 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
                                <div className="h-20 w-20 rounded-full bg-[#FBF7EE] flex items-center justify-center mb-6 ring-8 ring-[#F5EEDC]">
                                    <Scan className="w-10 h-10 text-[#B8874A] animate-pulse" />
                                </div>
                                <h3 className="text-xl font-serif font-medium text-slate-800">Machine Mode Active</h3>
                                <p className="text-slate-500 mt-2 mb-8 max-w-xs text-center text-sm">Your QR Scanner machine is ready. Point it at a barcode and pull the trigger.</p>

                                <div className="w-full max-w-md space-y-4">
                                    <div className="relative">
                                        <TextInput
                                            ref={machineInputRef}
                                            onKeyDown={handleMachineScan}
                                            placeholder="Waiting for hardware scan..."
                                            className="w-full h-16 px-6 text-xl font-bold border-[#EAE6DF] focus:border-[#C9A24B] focus:ring-[#C9A24B] text-center rounded-2xl shadow-sm"
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <SecondaryButton
                                            onClick={() => triggerLookup(machineInputRef.current.input.value)}
                                            className="px-8 h-12 bg-white text-[#B8874A] border-[#D9C4A1] hover:bg-[#FBF7EE]"
                                        >
                                            Lookup manually
                                        </SecondaryButton>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="font-semibold text-sm">{error}</span>
                            </div>
                        )}

                        {isLoading && (
                            <div className="mt-6 flex flex-col items-center justify-center py-10 text-slate-400">
                                <div className="h-10 w-10 border-4 border-[#B8874A]/20 border-t-[#B8874A] rounded-full animate-spin mb-4"></div>
                                <p className="font-medium text-sm">Searching catalog...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-[#FBF7EE] text-[#B8874A] rounded-xl flex items-center justify-center mb-3">
                            <span className="font-bold">1</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Allow Camera access when prompted</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                            <span className="font-bold">2</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Align barcode within the scanning box</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                            <span className="font-bold">3</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Review product and adjust stock</p>
                    </div>
                </div>
            </div>

            {/* Quick Adjust Modal */}
            <Modal show={isAdjustModalOpen} onClose={() => {
                setIsAdjustModalOpen(false);
                setScannedResult(null);
            }}>
                {product && (
                    <div className="p-0 overflow-hidden">
                        <div className="p-8 bg-[#B8874A] text-white relative">
                            <div className="flex gap-4 items-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-white p-1" />
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <Package className="w-8 h-8 text-white" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBF7EE]">{product.sku}</p>
                                        {product.category && (
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white/10 rounded-full border border-white/10 text-white truncate max-w-[100px]">
                                                {product.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold truncate leading-tight">{product.name}</h3>
                                    <p className="text-sm font-medium text-white/90 mt-0.5">
                                        Retail: <span className="font-sans text-white/70 select-none mr-0.5">₦</span>{parseFloat(product.retail_price).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="absolute top-8 right-8">
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 flex flex-col items-center">
                                    <span className="text-[10px] font-bold uppercase text-[#FBF7EE]">Stock</span>
                                    <span className="text-xl font-black">{product.current_stock}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleAdjustment} className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Adjustment Type" className="mb-2" />
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'IN' })}
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-bold ${formData.type === 'IN'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Stock IN
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'OUT' })}
                                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-bold ${formData.type === 'OUT'
                                                ? 'bg-red-50 border-red-500 text-red-700'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Stock OUT
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Quantity" className="mb-2" />
                                    <TextInput
                                        type="number"
                                        min="1"
                                        className="w-full h-[104px] text-center text-4xl font-black rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B]"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Movement Notes (Optional)" className="mb-2" />
                                <textarea
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-[#C9A24B] focus:ring-[#C9A24B] min-h-[80px]"
                                    placeholder="Reason for adjustment..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <SecondaryButton onClick={() => setIsAdjustModalOpen(false)} className="flex-1 justify-center h-12">
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton className="flex-1 justify-center h-12 bg-[#B8874A] hover:bg-[#A3743B] focus:ring-[#C9A24B] flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Confirm adjustment
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
