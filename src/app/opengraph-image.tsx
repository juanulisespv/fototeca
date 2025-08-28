import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = 'Fototeca - Gestión Inteligente de Fotos'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1f2937',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              marginRight: 20,
            }}
          >
            📸
          </div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Fototeca
          </div>
        </div>
        <div
          style={{
            fontSize: 30,
            color: 'white',
            textAlign: 'center',
            maxWidth: 800,
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          Gestión Inteligente de Fotos con IA
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
