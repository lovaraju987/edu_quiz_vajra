
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminTVPage() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>({
        slides: [],
        scrollerOne: [],
        scrollerTwo: [],
        headerAds: []
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/tv");
            const data = await res.json();
            if (data.success && data.data) {
                let currentAds = data.data.headerAds || [];
                if (currentAds.length === 0) {
                    currentAds = [
                        { title: "Ad Space 1", imageUrl: "/images/ads/byjus_bg.svg", link: "#" },
                        { title: "Ad Space 2", imageUrl: "/images/ads/unacademy_bg.svg", link: "#" },
                        { title: "Ad Space 3", imageUrl: "/images/ads/khan_bg.svg", link: "#" },
                        { title: "Ad Space 4", imageUrl: "/images/ads/coursera_bg.svg", link: "#" }
                    ];
                }
                setSettings({
                    ...data.data,
                    headerAds: currentAds
                });
            }
        } catch (error) {
            toast.error("Failed to load TV settings");
        } finally {
            setLoading(false);
        }
    };

    // ...

    const addItem = (key: 'scrollerOne' | 'scrollerTwo' | 'headerAds') => {
        const newItem = key === 'headerAds'
            ? { title: "New Ad", imageUrl: "/images/edu-quiz-logo.png", link: "#" }
            : { name: "New Item", imageUrl: "" };

        setSettings({
            ...settings,
            [key]: [...(settings[key] || []), newItem]
        });
    };

    const handleSave = async () => {
        try {
            const res = await fetch("/api/admin/tv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("TV Content Updated Successfully!");
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    // Helper to update state deeply
    const updateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...settings.slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSettings({ ...settings, slides: newSlides });
    };

    const addSlide = () => {
        setSettings({
            ...settings,
            slides: [...settings.slides, { title: "New Slide", description: "Desc", imageUrl: "", badge: "New" }]
        });
    };

    const removeSlide = (index: number) => {
        const newSlides = settings.slides.filter((_: any, i: number) => i !== index);
        setSettings({ ...settings, slides: newSlides });
    }

    const updateScroller = (key: 'scrollerOne' | 'scrollerTwo' | 'headerAds', index: number, field: string, value: string) => {
        const list = [...(settings[key] || [])];
        list[index] = { ...list[index], [field]: value };
        setSettings({ ...settings, [key]: list });
    }

    const removeItem = (key: 'scrollerOne' | 'scrollerTwo' | 'headerAds', index: number) => {
        const list = (settings[key] || []).filter((_: any, i: number) => i !== index);
        setSettings({ ...settings, [key]: list });
    };

    if (loading) return <div className="p-8 text-center">Loading TV Config...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto pb-40">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-slate-800">📺 Live TV Manager</h1>
                <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Save Changes
                </button>
            </div>

            {/* SECTION 1: MAIN SLIDES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    🖼️ Main Slideshow (Backgrounds)
                    <button onClick={addSlide} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Add New</button>
                </h2>
                <div className="space-y-4">
                    {settings.slides.map((slide: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 border rounded-xl bg-slate-50 items-start">
                            <div className="w-16 h-16 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {slide.imageUrl ? (
                                    <Image src={slide.imageUrl} alt="preview" fill className="object-cover" />
                                ) : <span className="text-xs flex items-center justify-center h-full text-slate-400">No Image</span>}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    className="p-2 border rounded"
                                    placeholder="Title"
                                    value={slide.title}
                                    onChange={(e) => updateSlide(i, 'title', e.target.value)}
                                />
                                <input
                                    className="p-2 border rounded"
                                    placeholder="Description"
                                    value={slide.description}
                                    onChange={(e) => updateSlide(i, 'description', e.target.value)}
                                />
                                <input
                                    className="p-2 border rounded font-mono text-xs col-span-2"
                                    placeholder="Image URL (e.g., /images/gifts/tablet.png)"
                                    value={slide.imageUrl}
                                    onChange={(e) => updateSlide(i, 'imageUrl', e.target.value)}
                                />
                            </div>
                            <button onClick={() => removeSlide(i)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SECTION 2: SCROLLER 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🎁 First Scroller (Gifts/Products)
                        <button onClick={() => addItem('scrollerOne')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Add</button>
                    </h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {settings.scrollerOne.map((item: any, i: number) => (
                            <div key={i} className="flex gap-3 p-3 border rounded-lg items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded flex-shrink-0 relative overflow-hidden">
                                    {item.imageUrl && <Image src={item.imageUrl} alt="icon" fill className="object-contain" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        className="w-full p-1 text-sm border rounded"
                                        placeholder="Name"
                                        value={item.name}
                                        onChange={(e) => updateScroller('scrollerOne', i, 'name', e.target.value)}
                                    />
                                    <input
                                        className="w-full p-1 text-xs font-mono border rounded text-slate-500"
                                        placeholder="Image URL"
                                        value={item.imageUrl}
                                        onChange={(e) => updateScroller('scrollerOne', i, 'imageUrl', e.target.value)}
                                    />
                                </div>
                                <button onClick={() => removeItem('scrollerOne', i)} className="text-red-400 hover:text-red-600">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION 3: SCROLLER 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        🎫 Second Scroller (Brands)
                        <button onClick={() => addItem('scrollerTwo')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Add</button>
                    </h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {settings.scrollerTwo.map((item: any, i: number) => (
                            <div key={i} className="flex gap-3 p-3 border rounded-lg items-center">
                                <div className="w-10 h-10 bg-slate-100 rounded flex-shrink-0 relative overflow-hidden">
                                    {item.imageUrl && <Image src={item.imageUrl} alt="icon" fill className="object-contain" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        className="w-full p-1 text-sm border rounded"
                                        placeholder="Brand Name"
                                        value={item.name}
                                        onChange={(e) => updateScroller('scrollerTwo', i, 'name', e.target.value)}
                                    />
                                    <input
                                        className="w-full p-1 text-xs font-mono border rounded text-slate-500"
                                        placeholder="Image URL"
                                        value={item.imageUrl}
                                        onChange={(e) => updateScroller('scrollerTwo', i, 'imageUrl', e.target.value)}
                                    />
                                </div>
                                <button onClick={() => removeItem('scrollerTwo', i)} className="text-red-400 hover:text-red-600">×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 4: HEADER ADS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2 mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    📢 Header Ads (Website Top)
                    <button onClick={() => addItem('headerAds')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">+ Add Ad</button>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {settings.headerAds?.map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-3 p-3 border rounded-lg relative bg-slate-50">
                            <button onClick={() => removeItem('headerAds', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10 bg-white rounded-full p-1 shadow-sm">🗑️</button>

                            <div className="w-full h-24 bg-slate-200 rounded flex-shrink-0 relative overflow-hidden">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt="ad" fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">No Image</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <input
                                    className="w-full p-1 text-sm border rounded"
                                    placeholder="Ad Title (optional)"
                                    value={item.title || ''}
                                    onChange={(e) => updateScroller('headerAds', i, 'title', e.target.value)}
                                />
                                <input
                                    className="w-full p-1 text-xs font-mono border rounded text-slate-500"
                                    placeholder="Image URL"
                                    value={item.imageUrl}
                                    onChange={(e) => updateScroller('headerAds', i, 'imageUrl', e.target.value)}
                                />
                                <input
                                    className="w-full p-1 text-xs border rounded"
                                    placeholder="Link URL (optional)"
                                    value={item.link || ''}
                                    onChange={(e) => updateScroller('headerAds', i, 'link', e.target.value)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
