"use client";

import dynamic from"next/dynamic";
import { useEffect, useState } from"react";
import { canRender3D } from"@/lib/three/canRender3D";
import { HeroPoster } from"./HeroPoster";

// three.js loads only here, only on capable devices, and only client-side.
const Hero3D = dynamic(() => import("./Hero3D"), {
 ssr: false,
 loading: () => <HeroPoster />,
});

export function HeroScene() {
 const [enable3D, setEnable3D] = useState(false);
 useEffect(() => {
 setEnable3D(canRender3D());
 }, []);

 return (
 <div className="h-[360px] w-full sm:h-[440px]">
 {enable3D ? <Hero3D /> : <HeroPoster />}
 </div>
 );
}
