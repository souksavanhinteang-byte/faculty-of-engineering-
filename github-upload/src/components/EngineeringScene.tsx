import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Lang } from '../content'
import StructuralFallback from './StructuralFallback'

type Labels = {
  drag: string
  explode: string
  assemble: string
  reset: string
  description: string
  staticDescription: string
  disable: string
}
export type SceneProps = { lang: Lang; labels: Labels; onReady: () => void; onDisable: () => void }
type ModelApi = {
  explode: (value: boolean) => void
  reset: () => void
  rotate: (horizontal: number, vertical: number) => void
}

export default function EngineeringScene({ lang, labels, onReady, onDisable }: SceneProps) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<ModelApi | null>(null)
  const [exploded, setExploded] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    const mobile = matchMedia('(max-width: 1023px), (pointer: coarse)').matches
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !mobile,
        alpha: true,
        powerPreference: 'low-power',
      })
    } catch {
      setFallback(true)
      onReady()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5))
    renderer.setClearColor(0xf7f7f2, 0)
    renderer.shadowMap.enabled = !mobile
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.needsUpdate = !mobile
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.55
    element.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 80)
    camera.position.set(9, 7.2, 10)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.enableZoom = false
    controls.enableDamping = !motionPreference.matches
    controls.dampingFactor = 0.09
    controls.minPolarAngle = Math.PI / 6
    controls.maxPolarAngle = Math.PI / 2.25
    controls.rotateSpeed = 0.65
    controls.target.set(0, 2.1, 0)
    // Horizontal one-finger drags rotate; CSS pan-y leaves vertical swipes to the page.
    controls.touches.ONE = THREE.TOUCH.ROTATE
    controls.touches.TWO = THREE.TOUCH.ROTATE
    controls.update()
    controls.saveState()

    const model = new THREE.Group()
    model.rotation.y = -0.18
    scene.add(model)
    const base = new THREE.Group(),
      structure = new THREE.Group(),
      middle = new THREE.Group(),
      upper = new THREE.Group(),
      roof = new THREE.Group()
    model.add(base, structure, middle, upper, roof)
    const stone = new THREE.MeshStandardMaterial({
      color: '#d2d1bc',
      roughness: 0.85,
      metalness: 0.02,
    })
    const slab = new THREE.MeshStandardMaterial({ color: '#e6e5d7', roughness: 0.85 })
    const navy = new THREE.MeshStandardMaterial({
      color: '#214554',
      roughness: 0.55,
      metalness: 0.35,
    })
    const brass = new THREE.MeshStandardMaterial({
      color: '#b49a58',
      roughness: 0.45,
      metalness: 0.55,
    })
    const brassLight = new THREE.MeshStandardMaterial({
      color: '#c8b17c',
      roughness: 0.6,
      metalness: 0.2,
    })
    const glass = new THREE.MeshStandardMaterial({
      color: '#819a93',
      transparent: true,
      opacity: 0.2,
      roughness: 0.2,
      metalness: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    const box = (
      parent: THREE.Group,
      x: number,
      y: number,
      z: number,
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      parent.add(mesh)
      return mesh
    }
    const beam = (
      parent: THREE.Group,
      from: number[],
      to: number[],
      thickness: number,
      material: THREE.Material,
    ) => {
      const start = new THREE.Vector3(...from),
        end = new THREE.Vector3(...to),
        direction = end.clone().sub(start)
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, direction.length(), thickness),
        material,
      )
      mesh.position.copy(start).add(end).multiplyScalar(0.5)
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
      mesh.castShadow = true
      parent.add(mesh)
      return mesh
    }

    box(base, 0, -0.18, 0, 5.7, 0.16, 4.5, stone)
    box(base, 0, -0.06, 0, 5.3, 0.1, 4.1, slab)
    box(base, 0, 0.06, 0, 4.8, 0.15, 3.6, stone)
    for (let step = 0; step < 3; step++)
      box(base, 0, -0.15 + step * 0.065, 2.25 - step * 0.15, 1.8, 0.08, 0.25, slab)
    // Each floor is a separate group, allowing a continuous exploded-view animation.
    box(middle, 0, 1.77, 0, 4.85, 0.12, 3.55, slab)
    box(upper, 0, 3.4, 0, 4.85, 0.13, 3.55, slab)
    for (const y of [1.64, 3.27, 4.85]) {
      const parent = y < 2 ? middle : y < 4 ? upper : roof
      for (const z of [-1.55, 1.55]) box(parent, 0, y, z, 4.6, 0.19, 0.12, navy)
      for (const x of [-2.2, 0, 2.2]) box(parent, x, y, 0, 0.12, 0.19, 3.2, navy)
      if (y < 4) for (const x of [-1.1, 1.1]) box(parent, x, y + 0.03, 0, 0.07, 0.11, 3.25, navy)
    }
    for (const x of [-2.2, 0, 2.2])
      for (const z of [-1.55, 1.55]) {
        box(structure, x, 2.45, z, 0.13, 4.8, 0.13, navy)
        box(base, x, 0.15, z, 0.34, 0.18, 0.34, stone)
        for (const y of [1.64, 3.27, 4.85]) box(structure, x, y, z, 0.22, 0.26, 0.22, brass)
      }
    // Cross bracing, an internal stair, and balustrades make the structural study legible.
    beam(structure, [-2.2, 0.2, -1.55], [0, 3.25, -1.55], 0.055, brass)
    beam(structure, [0, 0.2, -1.55], [-2.2, 3.25, -1.55], 0.055, brass)
    beam(structure, [2.2, 1.8, -1.55], [2.2, 4.85, 1.55], 0.055, brass)
    for (let step = 0; step < 10; step++)
      box(structure, 1.35, 0.27 + step * 0.15, -1.25 + step * 0.25, 0.75, 0.07, 0.3, stone)
    for (const [parent, y] of [
      [middle, 1.85],
      [upper, 3.48],
    ] as const) {
      for (const x of [-2.26, 2.26]) {
        box(parent, x, y + 0.32, 0, 0.025, 0.62, 3.18, glass)
        beam(parent, [x, y + 0.64, -1.57], [x, y + 0.64, 1.57], 0.027, navy)
        for (const z of [-1.55, 0, 1.55]) box(parent, x, y + 0.32, z, 0.028, 0.64, 0.028, navy)
      }
      beam(parent, [-2.25, y + 0.64, 1.62], [2.25, y + 0.64, 1.62], 0.027, navy)
      for (const x of [-2.25, -1.1, 0, 1.1, 2.25])
        box(parent, x, y + 0.32, 1.62, 0.025, 0.64, 0.025, navy)
    }
    // A lightly covered gabled truss, rather than a solid roof, exposes the engineering.
    for (const z of [-1.85, -0.95, 0, 0.95, 1.85]) {
      beam(roof, [-2.65, 4.9, z], [0, 5.95, z], 0.1, brass)
      beam(roof, [0, 5.95, z], [2.65, 4.9, z], 0.1, brass)
      beam(roof, [-2.65, 4.9, z], [2.65, 4.9, z], 0.07, navy)
      beam(roof, [-1.3, 4.9, z], [0, 5.95, z], 0.045, brassLight)
      beam(roof, [1.3, 4.9, z], [0, 5.95, z], 0.045, brassLight)
      beam(roof, [0, 4.9, z], [0, 5.95, z], 0.045, brassLight)
    }
    for (const x of [-2.55, -1.7, -0.85, 0, 0.85, 1.7, 2.55]) {
      const y = 5.95 - (Math.abs(x) / 2.65) * 1.05
      box(roof, x, y, 0, 0.05, 0.055, 4.02, brass)
    }
    const roofPanel = box(roof, -1.3, 5.46, 0, 2.82, 0.055, 4.02, brassLight)
    roofPanel.rotation.z = Math.atan2(1.05, 2.65)
    const panelEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(roofPanel.geometry),
      new THREE.LineBasicMaterial({ color: '#9a7b38' }),
    )
    roofPanel.add(panelEdges)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.28
    ground.receiveShadow = true
    scene.add(ground)
    const grid = new THREE.GridHelper(9, 18, '#a4b2a0', '#dfe3d8')
    grid.position.y = -0.27
    const gridMaterial = grid.material as THREE.Material
    gridMaterial.transparent = true
    gridMaterial.opacity = 0.28
    scene.add(grid)
    scene.add(new THREE.HemisphereLight('#fffced', '#9fae9c', 2.5))
    const sun = new THREE.DirectionalLight('#fff5d8', 3.2)
    sun.position.set(-5, 10, 6)
    sun.castShadow = !mobile
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 10
    sun.shadow.camera.bottom = -8
    sun.shadow.normalBias = 0.04
    sun.shadow.bias = -0.001
    sun.shadow.radius = 4
    scene.add(sun)
    const fill = new THREE.DirectionalLight('#dbe8ee', 1.5)
    fill.position.set(5, 4, -3)
    scene.add(fill)

    let frame = 0,
      shown = true,
      disposed = false,
      target = 0,
      spread = 0,
      firstRender = true
    const invalidate = () => {
      if (!frame && !disposed && shown && !document.hidden) frame = requestAnimationFrame(render)
    }
    const render = () => {
      frame = 0
      if (disposed || !shown || document.hidden) return
      const previousSpread = spread
      spread = motionPreference.matches ? target : THREE.MathUtils.lerp(spread, target, 0.09)
      if (Math.abs(spread - target) < 0.001) spread = target
      middle.position.y = spread * 0.4
      upper.position.y = spread * 0.9
      roof.position.y = spread * 1.6
      middle.position.x = -spread * 0.3
      upper.position.x = spread * 0.3
      const targetHeight = 2.1 + spread * 0.65
      camera.position.y += targetHeight - controls.target.y
      controls.target.y = targetHeight
      const zoom = 1 / (1 + spread * 0.15)
      if (camera.zoom !== zoom) {
        camera.zoom = zoom
        camera.updateProjectionMatrix()
      }
      const moving = controls.update()
      if (previousSpread !== spread && !mobile) renderer.shadowMap.needsUpdate = true
      renderer.render(scene, camera)
      if (firstRender) {
        firstRender = false
        onReady()
      }
      if (spread !== target || moving) invalidate()
    }
    let previousWidth = 0,
      previousHeight = 0
    const resize = () => {
      const width = Math.round(element.clientWidth),
        height = Math.round(element.clientHeight)
      if (!width || !height) return
      if (width === previousWidth && height === previousHeight) return
      previousWidth = width
      previousHeight = height
      const aspect = width / height,
        span = 4.65
      camera.left = -span * aspect
      camera.right = span * aspect
      camera.top = span
      camera.bottom = -span
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      invalidate()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(element)
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        shown = entry.isIntersecting
        if (shown) invalidate()
        else {
          cancelAnimationFrame(frame)
          frame = 0
        }
      },
      { threshold: 0 },
    )
    visibilityObserver.observe(element)
    const visibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame)
        frame = 0
      } else invalidate()
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      shown = false
      cancelAnimationFrame(frame)
      frame = 0
      api.current = null
      setFallback(true)
    }
    document.addEventListener('visibilitychange', visibilityChange)
    renderer.domElement.addEventListener('webglcontextlost', contextLost)
    motionPreference.addEventListener('change', invalidate)
    controls.addEventListener('change', invalidate)
    api.current = {
      explode: (value) => {
        target = value ? 1 : 0
        invalidate()
      },
      reset: () => {
        target = 0
        controls.reset()
        invalidate()
      },
      rotate: (horizontal, vertical) => {
        const orbit = new THREE.Spherical().setFromVector3(
          camera.position.clone().sub(controls.target),
        )
        orbit.theta += horizontal
        orbit.phi = THREE.MathUtils.clamp(
          orbit.phi + vertical,
          controls.minPolarAngle,
          controls.maxPolarAngle,
        )
        camera.position.setFromSpherical(orbit).add(controls.target)
        controls.update()
        invalidate()
      },
    }
    resize()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', visibilityChange)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      motionPreference.removeEventListener('change', invalidate)
      controls.removeEventListener('change', invalidate)
      controls.dispose()
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry)
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material)
        }
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      renderer.dispose()
      renderer.domElement.remove()
      api.current = null
    }
  }, [onReady])

  const toggle = () => {
    const next = !exploded
    setExploded(next)
    api.current?.explode(next)
  }
  const reset = () => {
    setExploded(false)
    api.current?.reset()
  }
  return (
    <div
      className="scene-wrap"
      lang={lang}
      data-render-quality={
        matchMedia('(max-width: 1023px), (pointer: coarse)').matches ? 'mobile' : 'desktop'
      }
    >
      {fallback ? (
        <div role="img" aria-label={labels.staticDescription} className="scene-static-art">
          <StructuralFallback exploded={exploded} />
        </div>
      ) : (
        <div
          ref={host}
          className="scene"
          role="img"
          tabIndex={0}
          onKeyDown={(event) => {
            const horizontal =
              event.key === 'ArrowLeft' ? 0.15 : event.key === 'ArrowRight' ? -0.15 : 0
            const vertical = event.key === 'ArrowUp' ? -0.1 : event.key === 'ArrowDown' ? 0.1 : 0
            if (horizontal || vertical) {
              event.preventDefault()
              api.current?.rotate(horizontal, vertical)
            }
          }}
          aria-label={labels.description}
        />
      )}
      <div className="scene-controls">
        <p>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            aria-hidden="true"
          >
            <path d="M6 8h12m-3-3 3 3-3 3M18 16H6m3-3-3 3 3 3" />
          </svg>
          {labels.drag}
        </p>
        <div className="model-buttons">
          <button
            type="button"
            className="disable-model"
            onClick={onDisable}
            aria-label={labels.disable}
            title={labels.disable}
          >
            2D
          </button>
          <button onClick={toggle} aria-pressed={exploded} data-testid="explode-model">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="m2 8 6-3 6 3-6 3-6-3Zm0 3 6 3 6-3M2 5l6-3 6 3" />
            </svg>
            {exploded ? labels.assemble : labels.explode}
          </button>
          <button
            className="reset-model"
            onClick={reset}
            aria-label={labels.reset}
            title={labels.reset}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              aria-hidden="true"
            >
              <path d="M3 6a5 5 0 1 1 0 5M3 2v4h4" />
            </svg>
          </button>
        </div>
      </div>
      <span className="model-announcement" aria-live="polite">
        {exploded ? labels.explode : labels.assemble}
      </span>
    </div>
  )
}
