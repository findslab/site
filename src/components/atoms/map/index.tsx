import {Wrapper} from "@googlemaps/react-wrapper";
import {MapMain} from "./main";

export const Map = () => {
  return (
    <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <MapMain/>
    </Wrapper>
  )
}
