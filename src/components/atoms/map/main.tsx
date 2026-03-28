import { useEffect, useRef } from 'react'

export const MapMain = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {

      const map = new google.maps.Map(ref.current, {
        center: { lat: 37.4964864935383, lng: 127.052202096374 },
        zoom: 19,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        gestureHandling: 'none'
      })

      new google.maps.Marker({
        map: map,
        position: { lat: 37.4964864935383, lng: 127.052202096374 }
      })
    }
  }, [])

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}/>
  )
}
