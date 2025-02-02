import React, { useState } from 'react'
import HashLoader from 'react-spinners/HashLoader'
export const Loader = () => {
    const [loading, setLoading] = useState(true)

    return (
        <div className='d-flex justify-content-center'>
            <HashLoader color='#000' loading={loading} size={120} />
        </div>
    )
}
