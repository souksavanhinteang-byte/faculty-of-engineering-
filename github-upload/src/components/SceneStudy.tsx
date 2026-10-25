import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { t, ui, type Lang } from '../content'
import StructuralFallback from './StructuralFallback'
import type { SceneProps } from './EngineeringScene'

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function SceneStudy({ lang }: { lang: Lang }) {
  const host = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const userChoice = useRef(false)
  const requestedFocus = useRef(false)
  const onSceneError = useCallback(() => {
    setFailed(true)
    setReady(false)
    setScene(null)
  }, [])
  const onReady = useCallback(() => {
    setReady(true)
    if (requestedFocus.current) {
      requestedFocus.current = false
      requestAnimationFrame(() =>
        host.current
          ?.querySelector<HTMLElement>('.scene, .model-buttons button')
          ?.focus({ preventScroll: true }),
      )
    }
  }, [])

  useEffect(() => {
    const desktop = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (!desktop.matches || reduced.matches || connection?.saveData) return

    let disposed = false
    let painted = false
    let visible = false
    let idle = 0
    let timer = 0
    let firstFrame = 0
    let secondFrame = 0
    const schedule = () => {
      if (disposed || !painted || !visible) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const enable = () => {
          if (!disposed && !userChoice.current && visible && desktop.matches && !reduced.matches)
            setEnabled(true)
        }
        if ('requestIdleCallback' in window)
          idle = window.requestIdleCallback(enable, { timeout: 3000 })
        else enable()
      }, 1200)
    }
    const afterLoad = () => {
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          painted = true
          schedule()
        })
      })
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
      else {
        clearTimeout(timer)
        if (idle) window.cancelIdleCallback(idle)
      }
    })
    if (host.current) observer.observe(host.current)
    if (document.readyState === 'complete') afterLoad()
    else window.addEventListener('load', afterLoad, { once: true })
    return () => {
      disposed = true
      observer.disconnect()
      clearTimeout(timer)
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      if (idle) window.cancelIdleCallback(idle)
      window.removeEventListener('load', afterLoad)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    setFailed(false)
    void import('./EngineeringScene').then(
      (module) => {
        if (!disposed) setScene(() => module.default)
      },
      () => {
        if (!disposed) setFailed(true)
      },
    )
    return () => {
      disposed = true
    }
  }, [enabled, attempt])

  const enable = () => {
    userChoice.current = true
    requestedFocus.current = true
    setEnabled(true)
    if (failed) setAttempt((value) => value + 1)
  }
  const disable = () => {
    userChoice.current = true
    setEnabled(false)
    setReady(false)
    setScene(null)
    requestAnimationFrame(() =>
      host.current
        ?.querySelector<HTMLButtonElement>('.scene-static-controls button')
        ?.focus({ preventScroll: true }),
    )
  }
  const pending = enabled && !Scene && !failed

  return (
    <div className="scene-shell" ref={host}>
      {!ready && (
        <div className="scene-wrap scene-placeholder">
          <div className="scene-static-art" role="img" aria-label={t(ui.sceneStatic, lang)}>
            <StructuralFallback />
          </div>
          <div className="scene-controls scene-static-controls">
            <p role="status">{t(failed ? ui.sceneFailed : ui.sceneStaticHint, lang)}</p>
            <button
              type="button"
              onClick={enable}
              disabled={pending}
              aria-controls="interactive-structure"
            >
              {t(pending ? ui.loading3D : ui.enable3D, lang)}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      )}
      <div id="interactive-structure" className={`scene-interactive ${ready ? 'is-ready' : ''}`}>
        {enabled && Scene && (
          <SceneBoundary key={attempt} onError={onSceneError}>
            <Scene
              lang={lang}
              onReady={onReady}
              onDisable={disable}
              labels={{
                drag: t(ui.drag, lang),
                explode: t(ui.explode, lang),
                assemble: t(ui.assemble, lang),
                reset: t(ui.reset, lang),
                description: t(ui.sceneDescription, lang),
                staticDescription: t(ui.sceneStatic, lang),
                disable: t(ui.disable3D, lang),
              }}
            />
          </SceneBoundary>
        )}
      </div>
    </div>
  )
}
