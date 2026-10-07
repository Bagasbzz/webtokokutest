import Link from 'next/link'
import { Store, ArrowLeft } from 'lucide-react'

export default function StoreNotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '24px',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        textAlign: 'center',
        maxWidth: '448px',
        width: '100%'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#F1F5F9',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Store size={40} color="#94A3B8" />
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#0F172A',
          marginBottom: '8px',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Toko Tidak Ditemukan
        </h1>
        
        <p style={{
          color: '#64748B',
          marginBottom: '32px',
          lineHeight: 1.6,
          fontSize: '15px'
        }}>
          URL toko yang kamu cari tidak ada, atau toko tersebut mungkin sudah tidak aktif.
        </p>

        <Link 
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            backgroundColor: '#16A34A',
            color: 'white',
            fontWeight: 600,
            padding: '14px 24px',
            borderRadius: '12px',
            transition: 'background-color 0.2s',
            textDecoration: 'none',
            fontSize: '15px'
          }}
        >
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: '1px solid #F1F5F9'
        }}>
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>
            Ingin membuat tokomu sendiri?{' '}
            <Link href="/auth/register" style={{ color: '#16A34A', textDecoration: 'none' }}>
              Daftar webtokoku gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
