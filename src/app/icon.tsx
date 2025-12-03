import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#775DEF', // Signature purple
          fontWeight: 900,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* The "I" acting as a vertical line of symmetry */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', height: '80%', width: '4px', background: '#775DEF' }}></div>
        
        {/* The "W" parts */}
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '80%', gap: '2px' }}>
            <div style={{ width: '4px', height: '100%', background: '#775DEF', transform: 'skewX(-15deg)' }}></div>
            <div style={{ width: '4px', height: '60%', background: '#775DEF', transform: 'skewX(15deg)' }}></div>
             {/* Space for the central I */}
            <div style={{ width: '6px' }}></div>
            <div style={{ width: '4px', height: '60%', background: '#775DEF', transform: 'skewX(-15deg)' }}></div>
            <div style={{ width: '4px', height: '100%', background: '#775DEF', transform: 'skewX(15deg)' }}></div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}