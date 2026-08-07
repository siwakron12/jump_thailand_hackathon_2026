import React from 'react'
import TopBar from '../(layout)/topBar'
type Props = {}

export default function Page({ }: Props) {
    return (
        <div className="px-2 lg:px-5 pt-5 pb-2">
            <TopBar />
        </div>
    )
}