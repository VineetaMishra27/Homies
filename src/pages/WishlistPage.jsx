import { C, btnPrimary, btnSecondary } from '../styles'
import PGCard from '../components/PGCard'

export default function WishlistPage({ wishlist, setWishlist, setSelectedPG, setPage }) {
    const removeFromWishlist = (pgId) => {
        const updated = wishlist.filter(pg => pg.id !== pgId)
        setWishlist(updated)
        localStorage.setItem('homies_wishlist', JSON.stringify(updated))
    }

    if (wishlist.length === 0) {
        return (
            <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 20 }}>
                <p style={{ fontSize: 56, marginBottom: 16 }}>♡</p>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: C.text, marginBottom: 8 }}>Your wishlist is empty</h2>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 24 }}>Save PGs you like by clicking the ♡ button on any listing.</p>
                <button onClick={() => setPage('listings')} style={{ ...btnPrimary, padding: '12px 28px' }}>Browse PGs →</button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: 24, color: C.text, margin: '0 0 4px' }}>My Wishlist ❤️</h1>
                    <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{wishlist.length} saved {wishlist.length === 1 ? 'property' : 'properties'}</p>
                </div>
                <button
                    onClick={() => { setWishlist([]); localStorage.removeItem('homies_wishlist') }}
                    style={{ ...btnSecondary, fontSize: 13, color: '#B91C1C', borderColor: '#FECACA' }}
                >
                    Clear All
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
                {wishlist.map(pg => (
                    <div key={pg.id} style={{ position: 'relative' }}>
                        <PGCard pg={pg} onClick={() => setSelectedPG(pg)} />
                        <button
                            onClick={e => { e.stopPropagation(); removeFromWishlist(pg.id) }}
                            style={{
                                position: 'absolute', top: 10, right: 10,
                                background: '#fff', border: 'none', borderRadius: '50%',
                                width: 30, height: 30, cursor: 'pointer', fontSize: 16,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2,
                            }}
                            title="Remove from wishlist"
                        >
                            ❤️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
