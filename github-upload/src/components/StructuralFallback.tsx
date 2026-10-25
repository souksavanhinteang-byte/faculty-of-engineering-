export default function StructuralFallback({ exploded = false }: { exploded?: boolean }) {
  return (
    <div className="scene-fallback">
      <svg viewBox="0 0 500 430" fill="none" aria-hidden="true">
        <g stroke="#183b49" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
          <path
            d="m60 330 220 77 170-100M85 345l170-100M130 361l170-100M175 377l170-100M220 393l170-100"
            strokeOpacity=".1"
          />
          <path fill="#e7e7dc" strokeOpacity=".3" d="m80 320 200 70 150-87-200-69-150 86Z" />
          <path fill="#f3f2e9" d="m95 305 185 65 135-79-185-65-135 79Z" />
          <path d="M95 305v8l185 65 135-79v-8M280 370v8" strokeOpacity=".4" />
          <g strokeWidth="3">
            <path d="M230 81v148M400 141v148M315 111v148" strokeOpacity=".6" />
          </g>
          <g transform={exploded ? 'translate(0 -16)' : undefined}>
            <path fill="#eeeee3" d="m100 228 180 63 130-76-180-63-130 76Z" />
            <path fill="#d9dccf" d="M100 228v7l180 63 130-76v-7l-130 76-180-63Z" />
            <path
              d="m110 216 170 59 120-70M110 216v-23m170 82v-23m120-47v-23"
              strokeOpacity=".35"
            />
          </g>
          <g transform={exploded ? 'translate(0 -28)' : undefined}>
            <path fill="#f5f4ea" d="m100 154 180 63 130-76-180-63-130 76Z" />
            <path fill="#d9dccf" d="M100 154v7l180 63 130-76v-7l-130 76-180-63Z" />
            <path
              d="m110 143 170 59 120-70M110 143v-23m170 82v-23m120-47v-23"
              strokeOpacity=".35"
            />
          </g>
          <g strokeWidth="3">
            <path d="M110 151v148M280 211v148M195 181v148" />
            <path d="m110 225 85 104m0-147 85 177" stroke="#b99a58" strokeWidth="1.4" />
          </g>
          <g
            stroke="#a88a47"
            strokeWidth="2.2"
            transform={exploded ? 'translate(0 -46)' : undefined}
          >
            <path fill="#e7dfc4" fillOpacity=".65" d="m85 137 97-21 145-84-97 21-145 84Z" />
            <path fill="#f5f2e6" fillOpacity=".65" d="m182 116 98 89 145-84-98-89-145 84Z" />
            <path d="m85 137 97-21 98 89-195-68Zm145-84 97-21 98 89-195-68ZM85 137 230 53m-48 63 145-84m-47 173 145-84" />
            <path
              d="m121 116 97-21 98 89-195-68m36-21 97-21 98 89-195-68m36-21 97-21 98 89-195-68"
              strokeWidth="1.1"
            />
            <path
              d="m134 126 145-84m-48 118 145-84M182 116v55m-61-55 91 32m-55-53 91 32m-55-53 91 32"
              strokeWidth="1"
            />
          </g>
          <path d="m68 351 212 73 159-93" strokeOpacity=".2" strokeDasharray="3 6" />
        </g>
      </svg>
    </div>
  )
}
