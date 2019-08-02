import React from 'react';

export default function Level2Content() {
    return (
        <section className="section level2">
            <div className="tile is-ancestor">
                <div className="tile is-parent">
                    <div className="tile is-child box">
                        <p className="title">What it is</p>
                        <div className="container">
                            <div className="subtitle">
                                Name and record your workouts. You create
                                the name, add the reptitions and at what weight.
                                Get stronger by keeping track of your previous
                                workouts. Never lose track of what you did so you
                                know what you goals are.
                         </div>
                        </div>

                    </div>
                </div>
                <div className="tile is-parent">
                    <div className="tile is-child box">
                        <p className="title">How it's built</p>
                        <div className="subtitle">
                            We've built everything using Blockstack, which is a web 3.0 technology.
                            The idea is to keep your data secure from prying eyes (even us!). We believe
                            data is super valueable and should be kept safe and that's why we've chosen to use
                            blockstack.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}