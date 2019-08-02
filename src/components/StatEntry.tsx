import React from 'react';

interface Props{
    name: string, 
    value: string
}

export default function statEntry(props: Props) {
    return( 
        <div className="level is-mobile">
        <div className="level-left">
            <div className='level-item'>
                <p className="subtitle">{props.name}</p>
            </div>
        </div>
        <div className="level-right">
            <div className='level-item'>
                <p>{props.value}</p>
            </div>
        </div>
    </div>
    )
}