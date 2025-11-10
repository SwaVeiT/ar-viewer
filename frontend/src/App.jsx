// import React, { useState, useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { Camera, Maximize2, RotateCw, X, Smartphone, Box } from 'lucide-react';

// const ARProductViewer = () => {
//   const [products, setProducts] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [isARSupported, setIsARSupported] = useState(false);
//   const [isARActive, setIsARActive] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [viewMode, setViewMode] = useState('gallery'); // gallery, 3d-viewer, ar
//   const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));

//   const containerRef = useRef(null);
//   const rendererRef = useRef(null);
//   const sceneRef = useRef(null);
//   const cameraRef = useRef(null);
//   const modelRef = useRef(null);
//   const reticleRef = useRef(null);
//   const hitTestSourceRef = useRef(null);
//   const sessionRef = useRef(null);
//   const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;


//   // Check WebXR support
//   useEffect(() => {
//     if ('xr' in navigator) {
//       navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
//         setIsARSupported(supported);
//       });
//     }
//   }, []);

//   // Fetch products
//   useEffect(() => {
//     fetchProducts();
//   }, []);

// //   const fetchProducts = async () => {
// //     try {
// //       setLoading(true);
// //       // Mock data for demo - replace with actual API call
// // const mockProducts = [
// //   {
// //     _id: '1',
// //     name: 'Modern Chair',
// //     description: 'Comfortable ergonomic chair',
// //     modelUrl: '/models/chair.glb',
// //     thumbnailUrl: '/thumbnail/chair.png',
// //     dimensions: { width: 0.6, height: 0.85, depth: 0.6 },
// //     scale: 1,
// //     category: 'Furniture'
// //   },
// //   {
// //     _id: '2',
// //     name: 'Table Lamp',
// //     description: 'Elegant desk lamp',
// //     modelUrl: '/models/lamp.glb',  // ✅ FIXED (removed slash before .glb)
// //     thumbnailUrl: '/thumbnail/lamp.png',
// //     dimensions: { width: 0.2, height: 0.4, depth: 0.2 },
// //     scale: 1,
// //     category: 'Lighting'
// //   },
// //   {
// //     _id: '3',
// //     name: 'Coffee Table',
// //     description: 'Modern coffee table',
// //     modelUrl: '/models/coffe_tab.glb',  // ✅ CORRECT
// //     thumbnailUrl: '/thumbnail/table.png',
// //     dimensions: { width: 1.0, height: 0.4, depth: 0.6 },
// //     scale: 1,
// //     category: 'Furniture'
// //   }
// // ];

// //       setProducts(mockProducts);
// //     } catch (err) {
// //       setError('Failed to load products');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// const fetchProducts = async () => {
//   try {
//     setLoading(true);

//     const res = await fetch(`${API_BASE_URL}/api/products`);

//     if (!res.ok) throw new Error("Failed to fetch products");

//     let data = await res.json();

//     data = data.map((p) => ({
//       ...p,
//       modelUrl: `${API_BASE_URL}${p.modelUrl}`,
//       thumbnailUrl: p.thumbnailUrl ? `${API_BASE_URL}${p.thumbnailUrl}` : null
//     }));

//     setProducts(data);
//   } catch (err) {
//     console.error("Product fetch error:", err);
//     setError("Failed to load products");
//   } finally {
//     setLoading(false);
//   }
// };

//   const recordAnalytics = async (eventType, duration = null) => {
//     try {
//      await fetch(`${API_BASE_URL}/api/analytics`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           productId: selectedProduct?._id,
//           eventType,
//           sessionId,
//           deviceInfo: {
//             userAgent: navigator.userAgent,
//             hasWebXR: 'xr' in navigator,
//             hasAR: isARSupported
//           },
//           duration
//         })
//       });
//     } catch (err) {
//       console.error('Analytics error:', err);
//     }
//   };

//   const init3DViewer = () => {
//     if (!containerRef.current || !selectedProduct) return;

//     // Clear previous scene
//     if (rendererRef.current) {
//       rendererRef.current.dispose();
//       containerRef.current.innerHTML = '';
//     }

//     // Create scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0xf0f0f0);
//     sceneRef.current = scene;

//     // Create camera
//     const camera = new THREE.PerspectiveCamera(
//       50,
//       containerRef.current.clientWidth / containerRef.current.clientHeight,
//       0.01,
//       100
//     );
//     camera.position.set(0, 1, 2);
//     cameraRef.current = camera;

//     // Create renderer
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
//     renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.xr.enabled = true;
//     containerRef.current.appendChild(renderer.domElement);
//     rendererRef.current = renderer;

//     // Add lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//     directionalLight.position.set(1, 2, 3);
//     scene.add(directionalLight);

//     // Add grid
//     const gridHelper = new THREE.GridHelper(10, 10);
//     scene.add(gridHelper);

//     // Load model
//     const loader = new GLTFLoader();
//     loader.load(
//       selectedProduct.modelUrl,
//       (gltf) => {
//         const model = gltf.scene;
        
//         // Center and scale model
//         const box = new THREE.Box3().setFromObject(model);
//         const center = box.getCenter(new THREE.Vector3());
//         model.position.sub(center);
        
//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const scale = 1 / maxDim * (selectedProduct.scale || 1);
//         model.scale.setScalar(scale);

//         scene.add(model);
//         modelRef.current = model;
//         camera.lookAt(model.position);
//       },
//       undefined,
//       (error) => {
//         console.error('Error loading model:', error);
//         setError('Failed to load 3D model');
//       }
//     );

//     // Animation loop
//     const animate = () => {
//       renderer.setAnimationLoop(() => {
//         if (modelRef.current && !isARActive) {
//           modelRef.current.rotation.y += 0.005;
//         }
//         renderer.render(scene, camera);
//       });
//     };
//     animate();

//     // Handle resize
//     const handleResize = () => {
//       if (!containerRef.current) return;
//       camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
//     };
//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//       renderer.setAnimationLoop(null);
//     };
//   };

//   const startARSession = async () => {
//     if (!selectedProduct || !navigator.xr) return;

//     try {
//       setLoading(true);
//       recordAnalytics('ar_session');

//       const session = await navigator.xr.requestSession('immersive-ar', {
//         requiredFeatures: ['hit-test'],
//         optionalFeatures: ['dom-overlay'],
//         domOverlay: { root: document.body }
//       });

//       sessionRef.current = session;
//       setIsARActive(true);

//       // Set up XR renderer
//       await rendererRef.current.xr.setSession(session);

//       // Create reticle
//       const reticle = new THREE.Mesh(
//         new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
//         new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
//       );
//       reticle.matrixAutoUpdate = false;
//       reticle.visible = false;
//       sceneRef.current.add(reticle);
//       reticleRef.current = reticle;

//       // Set up hit test
//       const viewerSpace = await session.requestReferenceSpace('viewer');
//       hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });

//       // Handle select (tap to place)
//       session.addEventListener('select', onSelect);

//       // Handle session end
//       session.addEventListener('end', () => {
//         setIsARActive(false);
//         hitTestSourceRef.current = null;
//         sessionRef.current = null;
//         setViewMode('3d-viewer');
//       });

//       setLoading(false);
//     } catch (err) {
//       console.error('AR Error:', err);
//       setError('Failed to start AR session');
//       setLoading(false);
//     }
//   };

//   const onSelect = () => {
//     if (!reticleRef.current.visible || !modelRef.current) return;

//     // Clone and place model at reticle position
//     const clone = modelRef.current.clone();
//     clone.position.setFromMatrixPosition(reticleRef.current.matrix);
//     clone.visible = true;
//     sceneRef.current.add(clone);

//     recordAnalytics('placement');
//   };

//   useEffect(() => {
//     if (viewMode === '3d-viewer' && selectedProduct) {
//       const cleanup = init3DViewer();
//       return cleanup;
//     }
//   }, [viewMode, selectedProduct]);

//   // XR animation loop for hit testing
//   useEffect(() => {
//     if (!isARActive || !rendererRef.current) return;

//     rendererRef.current.setAnimationLoop((timestamp, frame) => {
//       if (frame && hitTestSourceRef.current && reticleRef.current) {
//         const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
        
//         if (hitTestResults.length > 0) {
//           const hit = hitTestResults[0];
//           const pose = hit.getPose(rendererRef.current.xr.getReferenceSpace());
//           reticleRef.current.visible = true;
//           reticleRef.current.matrix.fromArray(pose.transform.matrix);
//         } else {
//           reticleRef.current.visible = false;
//         }
//       }

//       rendererRef.current.render(sceneRef.current, cameraRef.current);
//     });
//   }, [isARActive]);

//   const handleProductSelect = (product) => {
//     setSelectedProduct(product);
//     setViewMode('3d-viewer');
//     setError(null);
//     recordAnalytics('view');
//   };

//   const captureScreenshot = () => {
//     if (!rendererRef.current) return;
    
//     rendererRef.current.render(sceneRef.current, cameraRef.current);
//     const screenshot = rendererRef.current.domElement.toDataURL('image/png');
    
//     const link = document.createElement('a');
//     link.download = `${selectedProduct.name}-ar.png`;
//     link.href = screenshot;
//     link.click();

//     recordAnalytics('screenshot');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Box className="w-8 h-8 text-blue-600" />
//               <h1 className="text-2xl font-bold text-gray-900">AR Product Viewer</h1>
//             </div>
//             {isARSupported && (
//               <div className="flex items-center gap-2 text-sm text-green-600">
//                 <Smartphone className="w-4 h-4" />
//                 <span>AR Ready</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {viewMode === 'gallery' && (
//           <div>
//             <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
            
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Loading products...</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {products.map((product) => (
//                 <div
//                   key={product._id}
//                   className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
//                   onClick={() => handleProductSelect(product)}
//                 >
//                   <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
//   {product.thumbnailUrl ? (
//     <img 
//       src={product.thumbnailUrl} 
//       alt={product.name} 
//       className="w-full h-full object-cover"
//     />
//   ) : (
//     <Box className="w-16 h-16 text-gray-400" />
//   )}
// </div>


//                   <div className="p-4">
//                     <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
//                     <p className="text-gray-600 text-sm mb-3">{product.description}</p>
//                     <div className="flex items-center justify-between">
//                       <span className="text-xs text-gray-500">{product.category}</span>
//                       <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
//                         View in AR
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {(viewMode === '3d-viewer' || viewMode === 'ar') && selectedProduct && (
//           <div>
//             {/* Controls */}
//             <div className="bg-white rounded-lg shadow-md p-4 mb-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
//                   <p className="text-sm text-gray-600">{selectedProduct.description}</p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setViewMode('gallery');
//                     setSelectedProduct(null);
//                     if (sessionRef.current) {
//                       sessionRef.current.end();
//                     }
//                   }}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="flex gap-2 mt-4">
//                 {isARSupported && !isARActive && (
//                   <button
//                     onClick={startARSession}
//                     disabled={loading}
//                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                   >
//                     <Smartphone className="w-4 h-4" />
//                     {loading ? 'Starting AR...' : 'View in AR'}
//                   </button>
//                 )}
//                 {!isARActive && (
//                   <button
//                     onClick={captureScreenshot}
//                     className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                   >
//                     <Camera className="w-4 h-4" />
//                     Screenshot
//                   </button>
//                 )}
//               </div>

//               {isARActive && (
//                 <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                   <p className="text-sm text-blue-800">
//                     👆 Point your device at a flat surface and tap to place the object
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* 3D Viewer Container */}
//             <div 
//               ref={containerRef}
//               className="bg-white rounded-lg shadow-md overflow-hidden"
//               style={{ height: '600px' }}
//             />

//             {error && (
//               <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//                 <p className="text-red-800">{error}</p>
//               </div>
//             )}

//             {/* Product Info */}
//             {selectedProduct.dimensions && (
//               <div className="mt-4 bg-white rounded-lg shadow-md p-4">
//                 <h3 className="font-semibold mb-2">Dimensions</h3>
//                 <div className="grid grid-cols-3 gap-4 text-sm">
//                   <div>
//                     <span className="text-gray-600">Width:</span>
//                     <span className="ml-2 font-medium">{selectedProduct.dimensions.width}m</span>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Height:</span>
//                     <span className="ml-2 font-medium">{selectedProduct.dimensions.height}m</span>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Depth:</span>
//                     <span className="ml-2 font-medium">{selectedProduct.dimensions.depth}m</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t mt-12">
//         <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
//           <p>AR Product Viewer - View products in your space using augmented reality</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default ARProductViewer;

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Camera, X, Smartphone, Box, RotateCcw, Trash2 } from 'lucide-react';

const ARProductViewer = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('gallery');
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [placedModels, setPlacedModels] = useState([]);

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const reticleRef = useRef(null);
  const hitTestSourceRef = useRef(null);
  const sessionRef = useRef(null);
  const placedObjectsRef = useRef([]);
 const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
console.log("🧠 Using API_BASE_URL:", API_BASE_URL);
  // Check WebXR support
  useEffect(() => {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported);
      });
    }
  }, []);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!res.ok) throw new Error("Failed to fetch products");
      
      let data = await res.json();
      data = data.map((p) => ({
        ...p,
        modelUrl: `${API_BASE_URL}${p.modelUrl}`,
        thumbnailUrl: p.thumbnailUrl ? `${API_BASE_URL}${p.thumbnailUrl}` : null
      }));
      
      setProducts(data);
    } catch (err) {
      console.error("Product fetch error:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const recordAnalytics = async (eventType, duration = null) => {
    try {
      await fetch(`${API_BASE_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?._id,
          eventType,
          sessionId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            hasWebXR: 'xr' in navigator,
            hasAR: isARSupported
          },
          duration
        })
      });
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  const init3DViewer = () => {
    if (!containerRef.current || !selectedProduct) return;

    if (rendererRef.current) {
      rendererRef.current.dispose();
      containerRef.current.innerHTML = '';
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      100
    );
    camera.position.set(0, 1, 2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    const loader = new GLTFLoader();
    loader.load(
      selectedProduct.modelUrl,
      (gltf) => {
        const model = gltf.scene;
        
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxDim * (selectedProduct.scale || 1);
        model.scale.setScalar(scale);

        scene.add(model);
        modelRef.current = model;
        camera.lookAt(model.position);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setError('Failed to load 3D model');
      }
    );

    const animate = () => {
      renderer.setAnimationLoop(() => {
        if (modelRef.current && !isARActive) {
          modelRef.current.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
      });
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
    };
  };

  const createReticle = () => {
    // Create a circular reticle with crosshair
    const reticleGeometry = new THREE.RingGeometry(0.12, 0.15, 32);
    const reticleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    
    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.rotateX(-Math.PI / 2);
    
    // Add center dot
    const dotGeometry = new THREE.CircleGeometry(0.02, 16);
    const dotMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.rotateX(-Math.PI / 2);
    dot.position.y = 0.001;
    reticle.add(dot);
    
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    
    return reticle;
  };

  const startARSession = async () => {
    if (!selectedProduct || !navigator.xr) return;

    try {
      setLoading(true);
      recordAnalytics('ar_session');

      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });

      sessionRef.current = session;
      setIsARActive(true);

      await rendererRef.current.xr.setSession(session);

      // Create enhanced reticle
      const reticle = createReticle();
      sceneRef.current.add(reticle);
      reticleRef.current = reticle;

      // Set up hit test
      const viewerSpace = await session.requestReferenceSpace('viewer');
      hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });

      // Handle select (tap to place)
      session.addEventListener('select', onSelect);

      // Handle session end
      session.addEventListener('end', () => {
        setIsARActive(false);
        hitTestSourceRef.current = null;
        sessionRef.current = null;
        placedObjectsRef.current = [];
        setPlacedModels([]);
        setViewMode('3d-viewer');
      });

      setLoading(false);
    } catch (err) {
      console.error('AR Error:', err);
      setError('Failed to start AR session: ' + err.message);
      setLoading(false);
    }
  };

  const onSelect = () => {
    if (!reticleRef.current?.visible || !modelRef.current) return;

    // Clone and place model at reticle position
    const clone = modelRef.current.clone();
    
    // Get position from reticle
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(reticleRef.current.matrix);
    clone.position.copy(position);
    
    // Get rotation from reticle
    const rotation = new THREE.Euler();
    rotation.setFromRotationMatrix(reticleRef.current.matrix);
    clone.rotation.copy(rotation);
    
    clone.visible = true;
    sceneRef.current.add(clone);
    
    // Track placed objects
    placedObjectsRef.current.push(clone);
    setPlacedModels(prev => [...prev, { id: Date.now(), position }]);

    recordAnalytics('placement');
    
    // Visual feedback
    if (reticleRef.current) {
      const originalColor = reticleRef.current.material.color.getHex();
      reticleRef.current.material.color.setHex(0x00aaff);
      setTimeout(() => {
        if (reticleRef.current) {
          reticleRef.current.material.color.setHex(originalColor);
        }
      }, 200);
    }
  };

  const clearAllPlacements = () => {
    placedObjectsRef.current.forEach(obj => {
      sceneRef.current.remove(obj);
    });
    placedObjectsRef.current = [];
    setPlacedModels([]);
  };

  const undoLastPlacement = () => {
    if (placedObjectsRef.current.length > 0) {
      const lastObject = placedObjectsRef.current.pop();
      sceneRef.current.remove(lastObject);
      setPlacedModels(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (viewMode === '3d-viewer' && selectedProduct) {
      const cleanup = init3DViewer();
      return cleanup;
    }
  }, [viewMode, selectedProduct]);

  // XR animation loop for hit testing
  useEffect(() => {
    if (!isARActive || !rendererRef.current) return;

    rendererRef.current.setAnimationLoop((timestamp, frame) => {
      if (frame && hitTestSourceRef.current && reticleRef.current) {
        const referenceSpace = rendererRef.current.xr.getReferenceSpace();
        const hitTestResults = frame.getHitTestResults(hitTestSourceRef.current);
        
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          
          if (pose) {
            reticleRef.current.visible = true;
            reticleRef.current.matrix.fromArray(pose.transform.matrix);
            
            // Pulse animation for reticle
            const scale = 1 + Math.sin(timestamp / 200) * 0.1;
            reticleRef.current.scale.set(scale, scale, scale);
          }
        } else {
          reticleRef.current.visible = false;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    });

    return () => {
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null);
      }
    };
  }, [isARActive]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setViewMode('3d-viewer');
    setError(null);
    recordAnalytics('view');
  };

  const captureScreenshot = () => {
    if (!rendererRef.current) return;
    
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const screenshot = rendererRef.current.domElement.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `${selectedProduct.name}-ar.png`;
    link.href = screenshot;
    link.click();

    recordAnalytics('screenshot');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AR Product Viewer</h1>
            </div>
            {isARSupported && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Smartphone className="w-4 h-4" />
                <span>AR Ready</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'gallery' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Product Catalog</h2>
            
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img 
                        src={product.thumbnailUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Box className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{product.category}</span>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        View in AR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(viewMode === '3d-viewer' || viewMode === 'ar') && selectedProduct && (
          <div>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
                <button
                  onClick={() => {
                    setViewMode('gallery');
                    setSelectedProduct(null);
                    if (sessionRef.current) {
                      sessionRef.current.end();
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {isARSupported && !isARActive && (
                  <button
                    onClick={startARSession}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Smartphone className="w-4 h-4" />
                    {loading ? 'Starting AR...' : 'View in AR'}
                  </button>
                )}
                
                {!isARActive && (
                  <button
                    onClick={captureScreenshot}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Screenshot
                  </button>
                )}
                
                {isARActive && placedModels.length > 0 && (
                  <>
                    <button
                      onClick={undoLastPlacement}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Undo
                    </button>
                    <button
                      onClick={clearAllPlacements}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </>
                )}
              </div>

              {isARActive && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 font-semibold mb-2">
                    🎯 AR Mode Active
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Move your device to scan surfaces</li>
                    <li>• Green cursor shows where object will be placed</li>
                    <li>• Tap screen to place object at cursor location</li>
                    <li>• Place multiple objects by tapping repeatedly</li>
                    {placedModels.length > 0 && (
                      <li className="font-semibold">• {placedModels.length} object(s) placed</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* 3D Viewer Container */}
            <div 
              ref={containerRef}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              style={{ height: '600px' }}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Product Info */}
            {selectedProduct.dimensions && (
              <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold mb-2">Dimensions</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Width:</span>
                    <span className="ml-2 font-medium">{selectedProduct.dimensions.width}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Height:</span>
                    <span className="ml-2 font-medium">{selectedProduct.dimensions.height}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Depth:</span>
                    <span className="ml-2 font-medium">{selectedProduct.dimensions.depth}m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>AR Product Viewer - View and place products in your space using augmented reality</p>
        </div>
      </footer>
    </div>
  );
};

export default ARProductViewer;