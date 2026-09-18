import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Box, Tag, Layers, ArrowRight, DollarSign, AlertTriangle, User, History } from 'lucide-react';

export default function ProductSheet({ product }) {
    const { auth } = usePage().props;
    // Auto-trigger print dialog when the page loads
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000); 
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#FBFAF6] p-4 md:p-12">
            <Head title={`Product Information Sheet: ${product.sku}`} />
            
            <div className="max-w-4xl mx-auto no-print mb-8 flex justify-between items-center bg-white p-6 rounded-3xl border border-[#EAE6DF] shadow-sm">
                <div>
                    <h2 className="text-2xl font-serif font-medium text-[#1E1B18] tracking-tight">Print preview</h2>
                    <p className="text-slate-500 text-sm mt-1">Professional product datasheet optimized for A4/Letter sheets.</p>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-[#B8874A] text-white rounded-xl font-medium shadow-md hover:bg-[#A3743B] focus:ring-2 focus:ring-[#C9A24B] transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print document
                    </button>
                    <button 
                        onClick={() => window.close()}
                        className="px-6 py-3 bg-white border border-[#EAE6DF] text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* THE ACTUAL PRINTED DOCUMENT */}
            <div className="print-sheet bg-white mx-auto shadow-2xl relative border border-slate-100 print:shadow-none print:border-0 print:m-0 print:w-full"
                style={{ 
                    width: '210mm',
                    minHeight: '297mm',
                    padding: '25mm',
                    color: '#000',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                {/* Header Section */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-12">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 p-4 rounded-2xl shadow-xl shadow-slate-200">
                             <ApplicationLogo className="h-16 w-auto" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Elevate</h1>
                            <p className="text-slate-500 font-bold tracking-[0.3em] uppercase text-sm mt-1">Interiors System</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-900 text-white px-5 py-2 rounded-lg inline-block font-black text-xs tracking-widest uppercase mb-3">Product Datasheet</div>
                        <p className="text-slate-400 font-mono text-sm">Issue Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Top Section: Product Identity */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 block">Reference Code</span>
                        <h2 className="text-5xl font-black text-slate-900 mb-6">{product.sku}</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-black uppercase text-slate-400 block mb-1">Product Designation</span>
                                <p className="text-2xl font-bold leading-tight text-slate-800">{product.name}</p>
                            </div>
                            
                            <div className="flex gap-8 items-center pt-4">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-[#B8874A]" />
                                    <span className="font-bold text-slate-700">{product.category?.name || 'Uncategorized'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-[#B8874A]" />
                                    <span className="font-mono font-bold text-slate-700">{product.barcode_value}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center items-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="max-h-[250px] w-auto object-contain rounded-xl" />
                        ) : (
                            <div className="text-center">
                                <Box className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Image Available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial & Logistics Section */}
                <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Retail Value</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 leading-none">
                            <span className="font-sans font-medium text-slate-400 mr-1 select-none text-2xl">₦</span>
                            {parseFloat(product.retail_price).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <Box className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Stock On Hand</span>
                        </div>
                        <p className={`text-3xl font-black leading-none ${product.current_stock <= product.alert_threshold ? 'text-red-600' : 'text-slate-900'}`}>
                            {product.current_stock}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Alert Level</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 leading-none">{product.alert_threshold}</p>
                    </div>
                </div>

                {/* Description & Attributes */}
                <div className="grid grid-cols-5 gap-8 mb-12">
                    <div className="col-span-3">
                        <h3 className="text-xs font-black uppercase text-[#B8874A] tracking-[0.2em] mb-4 flex items-center gap-2">
                             Full Description
                             <div className="h-0.5 flex-1 bg-[#FBF7EE]"></div>
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {product.description || 'No detailed description provided for this catalog item.'}
                        </p>
                    </div>
                    <div className="col-span-2">
                         <h3 className="text-xs font-black uppercase text-[#B8874A] tracking-[0.2em] mb-4 flex items-center gap-2">
                             Specifications
                             <div className="h-0.5 flex-1 bg-[#FBF7EE]"></div>
                        </h3>
                        <div className="space-y-3">
                            {product.attributes && Object.entries(product.attributes).length > 0 ? (
                                Object.entries(product.attributes).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                                        <span className="text-slate-400 font-bold uppercase text-[10px]">{key}</span>
                                        <span className="text-slate-900 font-bold">
                                            {typeof value === 'object' && value !== null 
                                                ? (value.value || value.name || JSON.stringify(value)) 
                                                : String(value)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-xs italic">No specific attributes defined.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Barcode */}
                <div className="absolute bottom-16 inset-x-[25mm] border-t-2 border-slate-100 pt-8 flex justify-between items-end">
                    <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Official Verification Barcode</h4>
                        <img 
                            src={route('barcodes.generate', { value: product.barcode_value || product.sku, slug: auth.user.slug })} 
                            alt={product.barcode_value || product.sku}
                            className="h-24 w-80 object-contain bg-white"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                        <p className="font-mono text-sm tracking-[0.5em] mt-3 font-black uppercase opacity-60 text-center">{product.barcode_value}</p>
                    </div>
                    <div className="text-right pb-4">
                        <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest mb-1 italic">Generated via Elevate Interiors Cloud</p>
                        <p className="text-slate-400 text-xs font-mono">ID: {product.id}-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .print-sheet {
                        width: 100% !important;
                        height: 100% !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 20mm !important;
                        margin: 0 !important;
                    }
                }
                
                /* Ensure crisp printing */
                img {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                }
            `}</style>
        </div>
    );
}
