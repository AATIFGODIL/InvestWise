// InvestWise - A modern stock trading and investment education platform for young investors
import React from 'react';

export default function AppLogoIcon({ className }: { className?: string }) {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                position: 'relative',
                width: '100%',
                height: '100%',
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
                        width: '12%',
                        height: '100%',
                        background: '#775DEF',
                        transform: 'skewX(-15deg)',
                        borderRadius: '2px'
                    }}></div>
                    <div style={{
                        width: '12%',
                        height: '100%',
                        background: '#775DEF',
                        transform: 'skewX(15deg)',
                        borderRadius: '2px',
                        marginLeft: '-5%' // Overlap slightly
                    }}></div>
                </div>

                {/* Gap for the I */}
                <div style={{ width: '12%' }}></div>

                {/* Right V of the W */}
                <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '-1px' }}>
                    <div style={{
                        width: '12%',
                        height: '100%',
                        background: '#775DEF',
                        transform: 'skewX(-15deg)',
                        borderRadius: '2px'
                    }}></div>
                    <div style={{
                        width: '12%',
                        height: '100%',
                        background: '#775DEF',
                        transform: 'skewX(15deg)',
                        borderRadius: '2px',
                        marginLeft: '-5%'
                    }}></div>
                </div>
            </div>

            {/* The I - Taller and on top, vertically centered */}
            <div style={{
                position: 'absolute',
                width: '12%',
                height: '90%',
                background: '#775DEF',
                borderRadius: '2px',
                zIndex: 10,
                left: '50%',
                transform: 'translateX(-50%)'
            }}></div>
        </div>
    );
}
