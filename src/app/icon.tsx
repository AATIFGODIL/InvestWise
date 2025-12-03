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
          background: '#775DEF', // Signature purple background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%', // Rounded corners for icon look
          fontWeight: 900,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* The "I" acting as a vertical line of symmetry */}
            <div style={{ 
                position: 'absolute', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                height: '80%', 
                width: '3px', 
                background: 'white',
                borderRadius: '1px'
            }}></div>
            
            {/* The "W" parts - Symmetric around the I */}
            <div style={{ width: '100%', height: '80%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                {/* Left arm of W */}
                <div style={{ 
                    width: '3px', 
                    height: '100%', 
                    background: 'white', 
                    borderRadius: '1px',
                    transform: 'rotate(-15deg)',
                    transformOrigin: 'bottom right',
                    marginRight: '2px'
                }}></div>
                
                {/* Right arm of W */}
                <div style={{ 
                    width: '3px', 
                    height: '100%', 
                    background: 'white', 
                    borderRadius: '1px',
                    transform: 'rotate(15deg)',
                    transformOrigin: 'bottom left',
                    marginLeft: '2px'
                }}></div>
            </div>
            {/* Inner legs of W connecting to I */}
             <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '60%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                 <div style={{ width: '3px', height: '100%', background: 'white', transform: 'rotate(15deg)', transformOrigin: 'bottom right', marginRight: '1px', borderRadius: '1px' }}></div>
                 <div style={{ width: '3px', height: '100%', background: 'white', transform: 'rotate(-15deg)', transformOrigin: 'bottom left', marginLeft: '1px', borderRadius: '1px' }}></div>
             </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}