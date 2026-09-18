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
    const [manualCode, setManualCode] = useState('');
    const machineInputRef = useRef(null);

    const handleModeSwitch = async (newMode) => {
        if (newMode === scanMode) return;
        setError(null);

        // Explicitly tear down active scanner instance before unmounting DOM
        if (scannerRef.current) {
            try {
                await scannerRef.current.clear();
            } catch (err) {
                console.warn("Scanner teardown on switch:", err);
            }
            scannerRef.current = null;
        }

        const container = document.getElementById('reader');
        if (container) container.innerHTML = '';

        setScanMode(newMode);
    };

    useEffect(() => {
        if (scanMode === 'camera') {
            const container = document.getElementById('reader');
            if (container) container.innerHTML = '';

            try {
                const scanner = new Html5QrcodeScanner('reader', {
                    fps: 20, // Increased FPS for faster detection
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        // Wider box for 1D barcodes, square-ish for QR
                        const width = Math.floor(viewfinderWidth * 0.85);
                        const height = Math.min(Math.floor(viewfinderHeight * 0.5), 260);
                        return { width, height };
                    },
                    rememberLastUsedCamera: true,
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: true,
                });
                scannerRef.current = scanner;

                scanner.render(onScanSuccess, (err) => {
                    // Ignore standard "not found" frames while seeking
                    if (err?.includes("NotFound")) return;
                    console.error("Scanner error:", err);
                });
            } catch (err) {
                console.error("Failed to initialize Html5QrcodeScanner:", err);
            }
        }

        if (scanMode === 'machine') {
            const focusInput = () => machineInputRef.current?.focus();
            focusInput();
            window.addEventListener('click', focusInput);
            return () => window.removeEventListener('click', focusInput);
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.warn("Scanner cleanup on unmount:", error));
                scannerRef.current = null;
            }
            const container = document.getElementById('reader');
            if (container) container.innerHTML = '';
        };
    }, [scanMode]);

    // Handle machine (keyboard) scan
    const handleMachineScan = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            triggerLookup(manualCode);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        triggerLookup(manualCode);
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
        if (isAdjustModalOpen || isLoading) return;
        if (decodedText !== scannedResult) {
            triggerLookup(decodedText);
        }
    }

    function onScanFailure(error) {
        // quiet fail while scanning
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
            const message = err.response?.data?.message;
            setError(message ? `${message} ("${barcode}")` : `Product with code "${barcode}" not found in catalog.`);
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
                setManualCode('');
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
                                onClick={() => handleModeSwitch('camera')}
                                className={`flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${scanMode === 'camera' ? 'bg-[#B8874A] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Camera className="w-3.5 h-3.5 shrink-0" />
                                <span>Camera Scanner</span>
                            </button>
                            <button
                                onClick={() => handleModeSwitch('machine')}
                                className={`flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap ${scanMode === 'machine' ? 'bg-[#B8874A] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                            >
                                <Scan className="w-3.5 h-3.5 shrink-0" />
                                <span>Hardware Gun / Manual</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        {scanMode === 'camera' ? (
                            <div key="camera-scanner-view" className="animate-in fade-in zoom-in-95 duration-300">
                                <div id="reader" className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-[#D9C4A1] bg-slate-50 min-h-[340px]"></div>

                                <div className="mt-6 p-4 bg-[#FBF7EE] border border-[#EAE6DF] rounded-2xl flex items-start gap-3 text-slate-700 text-xs">
                                    <AlertCircle className="w-5 h-5 text-[#B8874A] shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-800">How to use Camera Scanner:</p>
                                        <p>1. Click <strong>"Request Camera Permissions"</strong> in the box above and allow access when prompted by your browser.</p>
                                        <p>2. Hold any product barcode or QR code steady in front of the lens (approx. 15-20cm away).</p>
                                        <p className="text-slate-400">Note: Ensure you are on <strong>HTTPS</strong> or <strong>localhost</strong>. On remote HTTP, browsers restrict camera access.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div key="hardware-gun-view" className="py-8 sm:py-12 md:py-16 flex flex-col items-center justify-center border-2 border-dashed border-[#D9C4A1] bg-[#FBF7EE]/40 rounded-2xl animate-in slide-in-from-bottom-4 duration-300 px-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-[#FBF7EE] flex items-center justify-center mb-4 sm:mb-5 ring-4 sm:ring-6 md:ring-8 ring-[#F5EEDC]">
                                    <Scan className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#B8874A] animate-pulse" />
                                </div>
                                <h3 className="text-base sm:text-lg md:text-xl font-serif font-medium text-slate-800 text-center tracking-tight">Hardware Gun & Manual Lookup</h3>
                                <p className="text-slate-500 mt-1.5 sm:mt-2 mb-5 sm:mb-6 max-w-md text-center text-xs sm:text-sm px-2">
                                    Aim your USB / Bluetooth barcode gun, or manually enter any product SKU or Barcode below.
                                </p>

                                <form onSubmit={handleManualSubmit} className="w-full max-w-md space-y-4">
                                    <div className="relative">
                                        <TextInput
                                            ref={machineInputRef}
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            onKeyDown={handleMachineScan}
                                            placeholder="SCAN BARCODE GUN OR TYPE SKU..."
                                            className="w-full h-12 sm:h-14 md:h-16 px-4 sm:px-6 text-xs sm:text-sm md:text-base lg:text-lg font-bold border-[#EAE6DF] focus:border-[#C9A24B] focus:ring-[#C9A24B] text-center rounded-xl sm:rounded-2xl shadow-sm font-mono uppercase tracking-wider"
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" title="Input active and listening"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-center">
                                        <PrimaryButton
                                            type="submit"
                                            disabled={isLoading || !manualCode.trim()}
                                            className="px-5 sm:px-8 h-10 sm:h-12 bg-[#8F5F26] hover:bg-[#784E1C] text-white focus:ring-2 focus:ring-[#B8874A] rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all"
                                        >
                                            Lookup Product
                                        </PrimaryButton>
                                        {manualCode && (
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => { setManualCode(''); setError(null); }}
                                                className="h-10 sm:h-12 px-4 sm:px-5 rounded-xl text-xs sm:text-sm text-slate-500 border-slate-200 hover:bg-slate-50"
                                            >
                                                Clear
                                            </SecondaryButton>
                                        )}
                                    </div>
                                </form>
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
                        <p className="text-sm font-semibold text-slate-700">Allow Camera or Connect Gun</p>
                        <p className="text-xs text-slate-400 mt-1">Allow webcam access or connect your handheld barcode scanner.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                            <span className="font-bold">2</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Scan Barcode or Type SKU</p>
                        <p className="text-xs text-slate-400 mt-1">Hold the barcode in the viewfinder or type any SKU directly.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] shadow-sm flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                            <span className="font-bold">3</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Instant Stock Adjustment</p>
                        <p className="text-xs text-slate-400 mt-1">Review live stock and instantly record Stock IN or Stock OUT.</p>
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
