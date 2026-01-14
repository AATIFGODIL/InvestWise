// InvestWise - A modern stock trading and investment education platform for young investors
import { ImageResponse } from 'next/og'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          position: 'relative',
        }}
      >
        {/* The W parts */}
        <div style={{ 
            display: 'flex', 
            height: '60%', 
            width: '100%', 
            justifyContent: 'center',
            position: 'absolute',
            bottom: '20%',
        }}>
            {/* Left V of the W */}
            <div style={{ display: 'flex', alignItems: 'flex-end', marginRight: '-1px' }}>
                <div style={{ 
                    width: '4px', 
                    height: '100%', 
                    background: '#775DEF', 
                    transform: 'skewX(-15deg)', 
                    borderRadius: '2px'
                }}></div>
                <div style={{ 
                    width: '4px', 
                    height: '100%', 
                    background: '#775DEF', 
                    transform: 'skewX(15deg)', 
                    borderRadius: '2px',
                    marginLeft: '-2px' // Overlap slightly
                }}></div>
            </div>

            {/* Gap for the I */}
            <div style={{ width: '4px' }}></div>

            {/* Right V of the W */}
            <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '-1px' }}>
                <div style={{ 
                    width: '4px', 
                    height: '100%', 
                    background: '#775DEF', 
                    transform: 'skewX(-15deg)', 
                    borderRadius: '2px'
                }}></div>
                <div style={{ 
                    width: '4px', 
                    height: '100%', 
                    background: '#775DEF', 
                    transform: 'skewX(15deg)', 
                    borderRadius: '2px',
                    marginLeft: '-2px' 
                }}></div>
            </div>
        </div>

        {/* The I - Taller and on top, vertically centered */}
        <div style={{ 
            position: 'absolute', 
            width: '4px', 
            height: '90%', 
            background: '#775DEF', 
            borderRadius: '2px',
            zIndex: 10,
            left: '50%',
            transform: 'translateX(-50%)'
        }}></div>
      </div>
    ),
    {
      ...size,
    }
  )
}