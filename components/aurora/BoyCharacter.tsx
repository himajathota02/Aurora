"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type Status = "loading" | "ready" | "error";

/** Loads the supplied model, walks it in from the right, then settles on its authored pose. */
export function BoyCharacter({ reducedMotion = false, onArrive }: { reducedMotion?: boolean; onArrive: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const reducedMotionRef = useRef(reducedMotion);
  const arriveRef = useRef(onArrive);

  useEffect(() => { reducedMotionRef.current = reducedMotion; arriveRef.current = onArrive; }, [reducedMotion, onArrive]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let character: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let walkAction: THREE.AnimationAction | null = null;
    const clock = new THREE.Clock();
    let approachElapsed = 0;
    let settled = false;
    let resizeFrame = 0;
    let renderFrame = 0;
    let resizeObserver: ResizeObserver | null = null;

    const render = () => {
      if (disposed || !renderer || !scene || !camera) return;
      renderer.render(scene, camera);
    };

    const animateCharacter = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      if (mixer) mixer.update(delta);
      if (character && !settled && reducedMotionRef.current) {
        character.position.set(0, 0, 0.5);
        character.rotation.y = 0;
        settled = true;
        walkAction?.stop();
        arriveRef.current();
      }
      if (character && !settled && !reducedMotionRef.current) {
        approachElapsed += delta;
        const duration = 4.8;
        const t = Math.min(approachElapsed / duration, 1);
        const eased = t * t * (3 - 2 * t);
        const startX = host.clientWidth < 650 ? 1.55 : 1.3;
        character.position.set(THREE.MathUtils.lerp(startX, 0, eased), 0, 0.5);
        const turn = THREE.MathUtils.clamp((t - 0.68) / 0.32, 0, 1);
        const easedTurn = turn * turn * (3 - 2 * turn);
        character.rotation.y = THREE.MathUtils.lerp(-Math.PI / 2, 0, easedTurn);
        if (t >= 1) {
          settled = true;
          walkAction?.fadeOut(0.45);
          window.setTimeout(() => { walkAction?.stop(); mixer?.update(0); }, 460);
          arriveRef.current();
        }
      }
      render();
      renderFrame = requestAnimationFrame(animateCharacter);
    };

    const resize = () => {
      if (!renderer || !camera || !host) return;
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 650 ? 34 : 30;
      camera.position.set(0, 1.25, width < 650 ? 4.55 : 4.15);
      camera.lookAt(0, 0.88, 0);
      camera.updateProjectionMatrix();
      render();
    };

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
      scene.add(new THREE.HemisphereLight(0xb8dcf1, 0x152029, 2.1));

      const fireLight = new THREE.DirectionalLight(0xffd09a, 3.1);
      fireLight.position.set(-2.7, 3.8, 3.5);
      fireLight.castShadow = true;
      fireLight.shadow.mapSize.set(1024, 1024);
      fireLight.shadow.camera.near = 0.1;
      fireLight.shadow.camera.far = 12;
      fireLight.shadow.camera.left = -2.5;
      fireLight.shadow.camera.right = 2.5;
      fireLight.shadow.camera.top = 3;
      fireLight.shadow.camera.bottom = -0.5;
      fireLight.shadow.bias = -0.0002;
      scene.add(fireLight);

      const auroraRim = new THREE.DirectionalLight(0x72d9c3, 1.45);
      auroraRim.position.set(2.5, 2.6, -2.5);
      scene.add(auroraRim);

      const shadowGround = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 80),
        new THREE.ShadowMaterial({ color: 0x07121b, opacity: 0.28 }),
      );
      shadowGround.rotation.x = -Math.PI / 2;
      shadowGround.position.y = 0.002;
      shadowGround.receiveShadow = true;
      scene.add(shadowGround);

      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(resize);
      });
      resizeObserver.observe(host);
      resize();

      new GLTFLoader().load(
        "/assets/boy.glb",
        (gltf) => {
          if (disposed || !scene) {
            gltf.scene.traverse((object) => {
              if (!(object instanceof THREE.Mesh)) return;
              object.geometry.dispose();
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach((material) => {
                Object.values(material).forEach((value) => {
                  if (value instanceof THREE.Texture) value.dispose();
                });
                material.dispose();
              });
            });
            return;
          }

          const model = gltf.scene;
          const bounds = new THREE.Box3().setFromObject(model);
          const center = bounds.getCenter(new THREE.Vector3());
          model.position.set(-center.x, -bounds.min.y, -center.z);
          const root = new THREE.Group();
          root.add(model);
          root.position.set(host.clientWidth < 650 ? 1.55 : 1.3, 0, 0.5);
          root.rotation.y = -Math.PI / 2;
          character = root;
          model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = true;
              object.receiveShadow = true;
              object.frustumCulled = true;
            }
          });
          scene.add(root);

          mixer = new THREE.AnimationMixer(model);
          const clip = gltf.animations.find((animation) => animation.name === "Casual_Walk")
            ?? gltf.animations.find((animation) => animation.name === "Walking");
          if (!reducedMotionRef.current && clip) {
            walkAction = mixer.clipAction(clip);
            walkAction.setLoop(THREE.LoopOnce, 1);
            walkAction.clampWhenFinished = true;
            walkAction.setEffectiveTimeScale(0.88);
            walkAction.play();
          } else {
            root.position.set(0, 0, 0.5);
            root.rotation.y = 0;
            settled = true;
            window.setTimeout(() => arriveRef.current(), 120);
          }

          renderFrame = requestAnimationFrame(() => {
            if (disposed) return;
            resize();
            setStatus("ready");
            renderFrame = requestAnimationFrame(animateCharacter);
          });
        },
        undefined,
        () => { if (!disposed) { setStatus("error"); arriveRef.current(); } },
      );
    } catch {
      renderFrame = requestAnimationFrame(() => {
        if (!disposed) { setStatus("error"); arriveRef.current(); }
      });
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(renderFrame);
      resizeObserver?.disconnect();
      if (scene) {
        scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        });
      }
      if (renderer) {
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      }
    };
  }, []);

  return <div className={`boy-character ${status === "ready" ? "character-ready" : ""}`} ref={hostRef} role="img" aria-label="The supplied 3D character beneath the aurora">
    {status === "error" && <span className="character-fallback" role="status">3D character unavailable · /assets/boy.glb</span>}
  </div>;
}
